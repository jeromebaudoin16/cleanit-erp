const express = require('express');
const multer = require('multer');
const ExcelJS = require('exceljs');
const pdfParse = require('pdf-parse');
const upload = multer({storage: multer.memoryStorage(), limits:{fileSize:10*1024*1024}});
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
// Limite de payload plus large pour /chacha/* : le prompt système + schémas d'outils + historique
// dépassent facilement 10kb. Doit être déclaré AVANT le express.json() global pour primer sur lui.
app.use('/chacha', express.json({ limit: '2mb' }));
app.use(express.json({ limit: '10kb' }));
const ALLOWED_ORIGINS = [
  'https://cleanit-erp-frontend.vercel.app',
  'https://frontend-rust-kappa-54.vercel.app',
];
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  const origin = req.headers.origin;
  if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith('-cleanit-erp.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
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

// ─── MIGRATION : étendre le type role si c'est un ENUM PostgreSQL ────────
// Le rôle 'bureau' et d'autres peuvent manquer de l'enum si la table a été créée avec un type restreint.
// On convertit en VARCHAR si nécessaire pour supporter tous les rôles métier CleanIT.
(async () => {
  try {
    // Vérifier si la colonne role est un enum
    const colInfo = await pool.query(`
      SELECT data_type, udt_name FROM information_schema.columns
      WHERE table_name='users' AND column_name='role'
    `);
    if (colInfo.rows[0] && colInfo.rows[0].data_type === 'USER-DEFINED') {
      // C'est un ENUM — ajouter les valeurs manquantes
      const enumName = colInfo.rows[0].udt_name;
      const existingVals = await pool.query(`SELECT unnest(enum_range(NULL::${enumName}))::text as val`);
      const existing = existingVals.rows.map(r => r.val);
      const needed = ['admin','project_manager','hr','technician','bureau','chef_projet','chef_terrain','comptable','rh','admin_sys'];
      for (const val of needed) {
        if (!existing.includes(val)) {
          await pool.query(`ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS '${val}'`).catch(() => {});
        }
      }
      console.log('Role enum extended with:', needed.filter(v => !existing.includes(v)));
    }
  } catch(e) { console.error('Role enum migration error:', e.message); }
})();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 8000,
});

if (!process.env.JWT_SECRET) {
  console.error('ERREUR CRITIQUE: JWT_SECRET non configuré. Définissez cette variable d\'environnement avant de démarrer.');
}
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
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

// ─── SAUVEGARDE AUTOMATIQUE (PRA/DRP) ──────────────────────────
// Exporte TOUTES les tables de la base vers un fichier JSON horodaté, stocké sur
// Vercel Blob (indépendant de Neon — si Neon a un problème, cette copie survit).
// Déclenché par un Cron Vercel quotidien (voir vercel.json), sécurisé par CRON_SECRET.
// Peut aussi être lancé manuellement par un admin authentifié.
app.get('/admin/backup', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
    let isAdminUser = false;
    if (!isCron && authHeader) {
      try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET);
        isAdminUser = ['admin', 'dg'].includes(decoded.role);
      } catch {}
    }
    if (!isCron && !isAdminUser) return res.status(401).json({ message: 'Non autorisé' });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ message: 'BLOB_READ_WRITE_TOKEN non configuré — active Vercel Blob Storage sur ce projet (onglet Storage du dashboard Vercel)' });
    }
    const { put } = require('@vercel/blob');

    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`
    );
    const dump = { generated_at: new Date().toISOString(), tables: {} };
    let totalRows = 0;
    for (const { table_name } of tablesRes.rows) {
      try {
        const t = await pool.query(`SELECT * FROM "${table_name}"`);
        dump.tables[table_name] = t.rows;
        totalRows += t.rows.length;
      } catch (e) {
        dump.tables[table_name] = { error: e.message };
      }
    }
    const json = JSON.stringify(dump);
    const filename = `backups/cleanit-backup-${new Date().toISOString().slice(0,10)}-${Date.now()}.json`;
    const blob = await put(filename, json, { access: 'public', contentType: 'application/json', addRandomSuffix: false });

    res.json({ ok: true, url: blob.url, tables: Object.keys(dump.tables).length, totalRows, sizeKB: Math.round(json.length/1024) });
  } catch (e) {
    console.error('Backup error:', e);
    res.status(500).json({ message: 'Erreur de sauvegarde', error: e.message });
  }
});


// Les clés GROQ_API_KEY / GEMINI_API_KEY vivent UNIQUEMENT dans les variables d'env du
// backend Vercel (jamais préfixées VITE_, donc jamais envoyées au navigateur).
// Le frontend envoie le même payload qu'avant (model/messages/tools pour Groq,
// systemInstruction/contents/tools pour Gemini) — ce proxy ne fait que rajouter la clé et relayer.
app.post('/chacha/groq', auth, async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ message: 'GROQ_API_KEY non configurée sur le serveur' });
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) { res.status(500).json({ message: 'Erreur proxy Groq', error: e.message }); }
});

app.post('/chacha/gemini', auth, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'GEMINI_API_KEY non configurée sur le serveur' });
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) { res.status(500).json({ message: 'Erreur proxy Gemini', error: e.message }); }
});

// ─── GÉNÉRATION DE DOCUMENTS (ChaCha) ──────────────────────────
// ChaCha peut générer une lettre Word, un tableau Excel, ou une présentation PowerPoint
// à la demande, et renvoie un lien de téléchargement (stocké sur Vercel Blob).
// ─── UPLOAD PHOTO (CleanCam) ────────────────────────────────────
// Stocke une photo terrain sur Vercel Blob et renvoie l'URL publique pour le Fil.
app.post('/upload/photo', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({ message: 'BLOB_READ_WRITE_TOKEN non configuré' });
    const { put } = require('@vercel/blob');
    const filename = `photos/cleanitcam-${req.user.sub}-${Date.now()}.jpg`;
    const blob = await put(filename, req.file.buffer, {
      access: 'public', contentType: req.file.mimetype || 'image/jpeg', addRandomSuffix: false,
    });
    res.json({ url: blob.url });
  } catch (e) {
    console.error('upload/photo error:', e);
    res.status(500).json({ message: 'Erreur upload photo', error: e.message });
  }
});

app.post('/chacha/generate-document', auth, async (req, res) => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({ message: 'BLOB_READ_WRITE_TOKEN non configuré — active Vercel Blob Storage sur ce projet' });
    }
    const { put } = require('@vercel/blob');
    const { type, title, content } = req.body;
    if (!type || !title) return res.status(400).json({ message: 'type et title requis' });

    let buffer, ext, mime;
    const userRow = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1', [req.user.sub]);
    const authorName = userRow.rows[0] ? userRow.rows[0].firstName + ' ' + userRow.rows[0].lastName : 'CleanIT SARL';
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (type === 'lettre' || type === 'word') {
      const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');
      const paragraphs = (Array.isArray(content) ? content : String(content || '').split('\n\n'))
        .filter(p => p && p.trim())
        .map(p => new Paragraph({ children: [new TextRun(p.trim())], spacing: { after: 200 } }));

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ children: [new TextRun({ text: 'CleanIT SARL', bold: true, size: 28 })] }),
            new Paragraph({ children: [new TextRun({ text: 'Sous-traitant télécom certifié Huawei — Douala, Cameroun', italics: true, size: 18 })], spacing: { after: 400 } }),
            new Paragraph({ children: [new TextRun({ text: 'Douala, le ' + today })], alignment: AlignmentType.RIGHT, spacing: { after: 400 } }),
            new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 26 })], spacing: { after: 300 } }),
            ...paragraphs,
            new Paragraph({ children: [new TextRun({ text: authorName })], spacing: { before: 400 } }),
          ],
        }],
      });
      buffer = await Packer.toBuffer(doc);
      ext = 'docx'; mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    } else if (type === 'excel') {
      const ExcelJS = require('exceljs');
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(title.slice(0, 30));
      const headers = content?.headers || [];
      const rows = content?.rows || [];
      ws.addRow(headers);
      ws.getRow(1).font = { bold: true };
      ws.getRow(1).eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A5276' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; });
      rows.forEach(r => ws.addRow(r));
      ws.columns.forEach(col => { col.width = 22; });
      buffer = await wb.xlsx.writeBuffer();
      ext = 'xlsx'; mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    } else if (type === 'presentation' || type === 'powerpoint') {
      const PptxGenJS = require('pptxgenjs');
      const pres = new PptxGenJS();
      const titleSlide = pres.addSlide();
      titleSlide.background = { color: '1A5276' };
      titleSlide.addText(title, { x: 0.5, y: 2.2, w: 9, h: 1.2, fontSize: 32, bold: true, color: 'FFFFFF', align: 'center' });
      titleSlide.addText('CleanIT SARL', { x: 0.5, y: 3.3, w: 9, h: 0.5, fontSize: 16, color: 'FFFFFF', align: 'center' });
      const slides = Array.isArray(content) ? content : [];
      slides.forEach(s => {
        const slide = pres.addSlide();
        slide.addText(s.title || '', { x: 0.5, y: 0.4, w: 9, h: 0.8, fontSize: 24, bold: true, color: '1A5276' });
        const bullets = (s.bullets || []).map(b => ({ text: b, options: { bullet: true, fontSize: 16, breakLine: true } }));
        if (bullets.length) slide.addText(bullets, { x: 0.6, y: 1.4, w: 8.8, h: 5 });
      });
      buffer = await pres.write({ outputType: 'nodebuffer' });
      ext = 'pptx'; mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    } else {
      return res.status(400).json({ message: "type doit être 'lettre', 'excel' ou 'presentation'" });
    }

    const safeTitle = title.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 50);
    const filename = `documents/${safeTitle}_${Date.now()}.${ext}`;
    const blob = await put(filename, buffer, { access: 'public', contentType: mime, addRandomSuffix: false });
    res.json({ ok: true, url: blob.url, filename: safeTitle + '.' + ext });
  } catch (e) {
    console.error('generate-document error:', e);
    res.status(500).json({ message: 'Erreur de génération', error: e.message });
  }
});


// ─── RECAP / BRIEF QUOTIDIEN (ChaCha) — données réelles, pas de contexte fictif ──
const ROLE_BRIEF_LABEL = { admin:'Administrateur', dg:'Directeur Général', hr:'Responsable RH', project_manager:'Chef de Projet', technician:'Technicien', bureau:'Collaborateur' };

async function gatherRealContext(userId, role) {
  const today = new Date().toISOString().slice(0,10);
  const [pendingApprovals, todayEvents, activeMissions] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM approvals WHERE status NOT IN ('approved','rejected','cancelled')`).catch(()=>({rows:[{count:0}]})),
    pool.query(`SELECT COUNT(*) FROM planning_events WHERE $1 BETWEEN start_date AND end_date`, [today]).catch(()=>({rows:[{count:0}]})),
    pool.query(`SELECT COUNT(*) FROM missions WHERE status NOT IN ('completed','cancelled')`).catch(()=>({rows:[{count:0}]})),
  ]);
  return {
    pendingApprovals: parseInt(pendingApprovals.rows[0]?.count || 0),
    todayEvents: parseInt(todayEvents.rows[0]?.count || 0),
    activeMissions: parseInt(activeMissions.rows[0]?.count || 0),
  };
}

async function generateBriefForUser(userId) {
  const userRes = await pool.query('SELECT "firstName","lastName",role FROM users WHERE id=$1', [userId]);
  const u = userRes.rows[0];
  if (!u) return null;
  const ctx = await gatherRealContext(userId, u.role);
  const roleLabel = ROLE_BRIEF_LABEL[u.role] || 'Collaborateur';
  const contextStr = `Demandes Approvals en attente: ${ctx.pendingApprovals}. Événements planning aujourd'hui: ${ctx.todayEvents}. Missions terrain actives: ${ctx.activeMissions}.`;
  const prompt = `Tu es ChaCha, assistant IA de CleanIT ERP. En 2 phrases maximum, génère un brief matinal court pour ${u.firstName} (${roleLabel}). Parle-lui directement, ton professionnel et chaleureux. Base-toi UNIQUEMENT sur ces chiffres réels, n'invente rien d'autre: ${contextStr}`;
  if (!process.env.GROQ_API_KEY) return contextStr; // pas de clé dispo, on renvoie au moins les chiffres bruts
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: 'openai/gpt-oss-120b', max_tokens: 100, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await r.json();
    return data.choices?.[0]?.message?.content || contextStr;
  } catch { return contextStr; }
}

app.get('/chacha/daily-brief', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0,10);
    await pool.query(`CREATE TABLE IF NOT EXISTS daily_briefs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), brief_date DATE, content TEXT, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, brief_date))`).catch(()=>{});
    if (req.query.refresh !== 'true') {
      const cached = await pool.query('SELECT content FROM daily_briefs WHERE user_id=$1 AND brief_date=$2', [req.user.sub, today]);
      if (cached.rows[0]) return res.json({ content: cached.rows[0].content, cached: true });
    }
    const content = await generateBriefForUser(req.user.sub);
    await pool.query(
      `INSERT INTO daily_briefs (user_id, brief_date, content) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, brief_date) DO UPDATE SET content=$3, created_at=NOW()`,
      [req.user.sub, today, content]
    ).catch(()=>{});
    res.json({ content, cached: false });
  } catch (e) { res.status(500).json({ message: 'Erreur de génération', error: e.message }); }
});

// Cron quotidien (voir vercel.json) — génère et stocke le brief de chaque utilisateur actif,
// et l'envoie en notification push aux utilisateurs mobiles.
app.get('/admin/daily-recap', async (req, res) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;
    if (!(cronSecret && authHeader === `Bearer ${cronSecret}`)) return res.status(401).json({ message: 'Non autorisé' });

    await pool.query(`CREATE TABLE IF NOT EXISTS daily_briefs (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), brief_date DATE, content TEXT, created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, brief_date))`).catch(()=>{});
    const today = new Date().toISOString().slice(0,10);
    const users = await pool.query(`SELECT id FROM users WHERE "isActive"=true`);
    let done = 0;
    for (const { id: userId } of users.rows) {
      try {
        const content = await generateBriefForUser(userId);
        await pool.query(
          `INSERT INTO daily_briefs (user_id, brief_date, content) VALUES ($1,$2,$3)
           ON CONFLICT (user_id, brief_date) DO UPDATE SET content=$3, created_at=NOW()`,
          [userId, today, content]
        );
        const subs = await pool.query('SELECT subscription FROM push_subscriptions WHERE user_id=$1', [userId]);
        for (const row of subs.rows) {
          try {
            await webpush.sendNotification(row.subscription, JSON.stringify({
              title: 'ChaCha — Brief du jour', body: content.slice(0, 120), data: { url: '/mobile' },
            }));
          } catch {}
        }
        done++;
      } catch {}
    }
    res.json({ ok: true, usersProcessed: done });
  } catch (e) { res.status(500).json({ message: 'Erreur recap', error: e.message }); }
});

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
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, moduleAccess: user.module_access || null } });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/auth/register', rateLimit(3, 60000), async (req, res) => {
  try {
    const email = sanitize(req.body.email || '').toLowerCase();
    const firstName = sanitize(req.body.firstName || '');
    const lastName = sanitize(req.body.lastName || '');
    const role = ['technician', 'bureau', 'project_manager'].includes(req.body.role) ? req.body.role : 'bureau';
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
    // Essaie d'abord avec module_access, repli sans si la colonne n'existe pas
    const result = await pool.query(
      'SELECT id, email, "firstName", "lastName", role, "isActive", "lastSeen", "createdAt", module_access FROM users ORDER BY "createdAt" DESC'
    ).catch(() => pool.query(
      'SELECT id, email, "firstName", "lastName", role, "isActive", "lastSeen", "createdAt" FROM users ORDER BY "createdAt" DESC'
    ));
    res.json((result.rows || []).map(r => ({ ...r, module_access: r.module_access || null })));
  } catch (e) {
    console.error('GET /users error:', e.message);
    res.status(500).json({ message: 'Erreur chargement utilisateurs: ' + e.message });
  }
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
    if (exists.rows[0]) return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    const hash = await bcrypt.hash(password, 12);
    let result;
    try {
      result = await pool.query(
        'INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id, email, "firstName", "lastName", role, "isActive"',
        [email, hash, firstName, lastName, role]
      );
    } catch (insertErr) {
      // Si erreur ENUM (invalid input value for enum) → convertir la colonne en VARCHAR puis réessayer
      if (insertErr.message && insertErr.message.includes('invalid input value for enum')) {
        await pool.query(`ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::text`).catch(() => {});
        result = await pool.query(
          'INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id, email, "firstName", "lastName", role, "isActive"',
          [email, hash, firstName, lastName, role]
        );
      } else { throw insertErr; }
    }
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error('POST /users error:', e.message, e.detail||'');
    res.status(500).json({ message: 'Erreur création utilisateur: ' + (e.detail||e.message) });
  }
});

app.put('/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });
    // Vérifier que c'est admin ou l'utilisateur lui-même
    const uQ = await pool.query('SELECT role FROM users WHERE id=$1',[req.user.sub]);
    const isAdm = ['admin','hr'].includes(uQ.rows[0]?.role);
    if(!isAdm && String(req.user.sub)!==String(id)) return res.status(403).json({message:'Non autorisé'});
    // Protection : un admin ne peut pas se retirer son propre rôle admin ni se désactiver lui-même
    // (ça le bloquerait hors de Paramètres sans moyen simple de revenir en arrière).
    if (String(req.user.sub) === String(id)) {
      if (req.body.role !== undefined && req.body.role !== 'admin' && uQ.rows[0]?.role === 'admin') {
        return res.status(400).json({ message: 'Tu ne peux pas retirer ton propre rôle administrateur' });
      }
      if (req.body.isActive === false) {
        return res.status(400).json({ message: 'Tu ne peux pas désactiver ton propre compte' });
      }
    }
    const updates = [];
    const values = [];
    let idx = 1;
    // Mapping camelCase → colonne DB (snake_case ou quoted camelCase)
    const fieldMap = {
      isActive: '"isActive"', role: 'role',
      firstName: '"firstName"', lastName: '"lastName"',
      phone: 'phone', department: 'department',
      salary: 'salary', contract: 'contract',
      city: 'city', address: 'address',
      bank: 'bank', rib: 'rib',
      matricule: 'matricule', education: 'education',
      gender: 'gender', birthDate: 'birth_date',
      birthPlace: 'birth_place', nationality: 'nationality',
      cin: 'cin', emergencyName: 'emergency_name',
      emergencyPhone: 'emergency_phone', emergencyLink: 'emergency_link',
      emergencyAddress: 'emergency_address',
      speciality: 'speciality', dailyRate: 'daily_rate',
      certifications: 'certifications', hireDate: 'hire_date',
      contractEnd: 'contract_end', cnps: 'cnps',
      numContribuable: 'num_contribuable', status: 'status',
      moduleAccess: 'module_access',
    };
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS module_access JSONB').catch(()=>{});
    for(const [f,col] of Object.entries(fieldMap)){
      if(req.body[f]!==undefined){
        updates.push(`${col} = $${idx++}`);
        // module_access arrive en tableau JS (ou null pour "revenir aux permissions par défaut du rôle") — il faut le sérialiser pour une colonne JSONB
        values.push(f==='moduleAccess' ? (req.body[f]===null ? null : JSON.stringify(req.body[f])) : req.body[f]);
      }
    }
    if(req.body.password && isAdm){
      updates.push(`password = $${idx++}`);
      values.push(await bcrypt.hash(req.body.password, 12));
    }
    if(!updates.length) return res.status(400).json({message:'Aucune modification'});
    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(',')} WHERE id = $${idx} RETURNING id,email,"firstName","lastName",role,"isActive",phone,department,salary,contract,city,address,bank,rib,matricule,education,gender,certifications,speciality,daily_rate,module_access`,
      values
    );
    res.json(result.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
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

// ─── COMMENTAIRES FIL ──────────────────────────────────────
app.get('/feed/:id/comments', auth, async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS feed_comments (
      id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(100), text TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW()
    )`).catch(()=>{});
    const r = await pool.query('SELECT * FROM feed_comments WHERE post_id=$1 ORDER BY created_at ASC', [req.params.id]);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/feed/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Texte requis' });
    await pool.query(`CREATE TABLE IF NOT EXISTS feed_comments (
      id SERIAL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER REFERENCES users(id),
      user_name VARCHAR(100), text TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW()
    )`).catch(()=>{});
    const user = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1', [req.user.sub]);
    const u = user.rows[0];
    const r = await pool.query(
      'INSERT INTO feed_comments (post_id,user_id,user_name,text) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, req.user.sub, u.firstName+' '+u.lastName, text.trim()]
    );
    await pool.query('UPDATE feed_posts SET comments_count = comments_count + 1 WHERE id=$1', [req.params.id]);
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
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

app.get('/whatsapp/messages', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM wa_messages ORDER BY created_at DESC LIMIT 50');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
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
  type VARCHAR(80),
  label VARCHAR(200),
  detail TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  priority VARCHAR(20) DEFAULT 'normale',
  amount NUMERIC(15,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'FCFA',
  justification TEXT,
  beneficiary_name VARCHAR(200),
  beneficiary_bank VARCHAR(100),
  beneficiary_account VARCHAR(100),
  beneficiary_mobile VARCHAR(50),
  site_code VARCHAR(50),
  project_code VARCHAR(50),
  submitted_by VARCHAR(100),
  submitted_at TIMESTAMP,
  n1_done BOOLEAN DEFAULT false,
  n1_by VARCHAR(100),
  n1_at TIMESTAMP,
  n1_comment TEXT,
  n1_decision VARCHAR(20),
  n2_done BOOLEAN DEFAULT false,
  n2_by VARCHAR(100),
  n2_at TIMESTAMP,
  n2_comment TEXT,
  n2_decision VARCHAR(20),
  dg_done BOOLEAN DEFAULT false,
  dg_by VARCHAR(100),
  dg_at TIMESTAMP,
  dg_comment TEXT,
  dg_decision VARCHAR(20),
  auto_approved BOOLEAN DEFAULT false,
  history JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  payment_ref VARCHAR(100),
  payment_method VARCHAR(100),
  paid_at TIMESTAMP,
  cib_entry_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// Migration colonnes manquantes
const migrateApprovals = async () => {
  const cols = [
    ['amount','NUMERIC(15,2) DEFAULT 0'],
    ['currency',"VARCHAR(10) DEFAULT 'FCFA'"],
    ['priority',"VARCHAR(20) DEFAULT 'normale'"],
    ['justification','TEXT'],
    ['beneficiary_name','VARCHAR(200)'],
    ['beneficiary_bank','VARCHAR(100)'],
    ['beneficiary_account','VARCHAR(100)'],
    ['beneficiary_mobile','VARCHAR(50)'],
    ['site_code','VARCHAR(50)'],
    ['project_code','VARCHAR(50)'],
    ['submitted_by','VARCHAR(100)'],
    ['submitted_at','TIMESTAMP'],
    ['n1_by','VARCHAR(100)'],['n1_at','TIMESTAMP'],['n1_comment','TEXT'],['n1_decision','VARCHAR(20)'],
    ['n2_by','VARCHAR(100)'],['n2_at','TIMESTAMP'],['n2_comment','TEXT'],['n2_decision','VARCHAR(20)'],
    ['dg_by','VARCHAR(100)'],['dg_at','TIMESTAMP'],['dg_comment','TEXT'],['dg_decision','VARCHAR(20)'],
    ['auto_approved','BOOLEAN DEFAULT false'],
    ['history',"JSONB DEFAULT '[]'"],
    ['attachments',"JSONB DEFAULT '[]'"],
    ['payment_ref','VARCHAR(100)'],
    ['payment_method','VARCHAR(100)'],
    ['paid_at','TIMESTAMP'],
    ['cib_entry_id','INTEGER'],
  ];
  for(const [col,def] of cols){
    await pool.query(`ALTER TABLE approvals ADD COLUMN IF NOT EXISTS ${col} ${def}`).catch(()=>{});
  }
};
migrateApprovals();

// ─── APPROVALS ROUTES ─────────────────────────────────────────
app.get('/approvals', auth, async (req, res) => {
  try {
    const uQ = await pool.query('SELECT role FROM users WHERE id=$1',[req.user.sub]);
    const role = uQ.rows[0]?.role||'';
    const isAdmin = ['admin','dg','project_manager','hr'].includes(role);
    const result = isAdmin
      ? await pool.query('SELECT * FROM approvals ORDER BY "createdAt" DESC')
      : await pool.query('SELECT * FROM approvals WHERE user_id=$1 OR "submittedBy"=$2 ORDER BY "createdAt" DESC',[req.user.sub, uQ.rows[0]?.email||'']);
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/approvals', auth, async (req, res) => {
  try {
    const { type, label, detail, amount, currency, justification,
            beneficiaryName, beneficiaryBank, beneficiaryAccount, beneficiaryMobile,
            siteCode, projectCode, priority } = req.body;
    const userQ = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const u = userQ.rows[0];
    const userName = ((u?.firstName||'')+' '+(u?.lastName||'')).trim();
    const hist = JSON.stringify([{action:'Créé',by:userName,at:new Date().toISOString(),comment:''}]);
    const result = await pool.query(
      `INSERT INTO approvals
       (reference,user_id,user_name,type,label,detail,amount,currency,justification,
        "beneficiaryName","beneficiaryBank","beneficiaryAccount","beneficiaryMobile",
        "siteCode","projectCode",priority,"submittedBy",status,history,duid,request_type,n1_done,n2_done,dg_done)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'pending',$18,$19,$20,false,false,false) RETURNING *`,
      ['APV-'+Date.now().toString().slice(-8),
       req.user.sub, userName, type, label||type, detail||justification||'',
       Number(amount)||0, currency||'FCFA', justification||detail||'',
       beneficiaryName||'', beneficiaryBank||'', beneficiaryAccount||'', beneficiaryMobile||'',
       siteCode||'', projectCode||'', priority||'normale', userName, hist,
       req.body.duid||'', req.body.request_type||type]
    );
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
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

// GET /sites — tous les sites réels avec coordonnées GPS (pour Map.jsx)
app.get('/sites', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, code, name, duid, "poNumber", region, ville, technology, status,
        latitude, longitude, "typeTravauxEnum"
      FROM sites
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
      ORDER BY name`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// Route ping pour maintenir last_seen actif depuis l'app mobile
app.post('/ping', auth, async (req, res) => {
  try {
    await pool.query('UPDATE users SET last_seen=NOW(), "lastSeen"=NOW() WHERE id=$1', [req.user.sub]);
    res.json({ ok: true, ts: new Date().toISOString() });
  } catch(e) { res.json({ ok: false }); }
});

// ─── SUIVI GPS TECHNICIENS ─────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS tech_locations (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  accuracy NUMERIC(8,2),
  battery INTEGER,
  status VARCHAR(30) DEFAULT 'disponible',
  current_site_code VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS tech_location_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lat NUMERIC(10,7) NOT NULL,
  lng NUMERIC(10,7) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// POST /location/update — l'app mobile envoie sa position en continu
app.post('/location/update', auth, async (req, res) => {
  try {
    const { lat, lng, accuracy, battery, status, siteCode } = req.body;
    if(lat==null || lng==null) return res.status(400).json({ message: 'lat et lng requis' });
    await pool.query(`
      INSERT INTO tech_locations (user_id, lat, lng, accuracy, battery, status, current_site_code, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        lat=$2, lng=$3, accuracy=$4, battery=$5, status=COALESCE($6,tech_locations.status),
        current_site_code=$7, updated_at=NOW()`,
      [req.user.sub, lat, lng, accuracy||null, battery||null, status||null, siteCode||null]
    );
    // Historique léger (1 point toutes les ~5min suffit pour la trajectoire du jour)
    const last = await pool.query(`SELECT recorded_at FROM tech_location_history WHERE user_id=$1 ORDER BY recorded_at DESC LIMIT 1`,[req.user.sub]);
    const lastTime = last.rows[0]?.recorded_at;
    if(!lastTime || (Date.now() - new Date(lastTime).getTime()) > 5*60*1000) {
      await pool.query(`INSERT INTO tech_location_history (user_id, lat, lng) VALUES ($1,$2,$3)`,[req.user.sub, lat, lng]).catch(()=>{});
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// GET /location/all — positions actuelles de tous les techniciens (pour Map.jsx)
app.get('/location/all', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT tl.user_id, tl.lat, tl.lng, tl.accuracy, tl.battery, tl.status, tl.current_site_code, tl.updated_at,
        u."firstName", u."lastName", u.role, u.email,
        CASE WHEN tl.updated_at > NOW()-INTERVAL '10 minutes' THEN true ELSE false END as is_live
      FROM tech_locations tl
      JOIN users u ON u.id = tl.user_id
      WHERE u."isActive" IS NOT FALSE
      ORDER BY tl.updated_at DESC`
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// GET /location/history/:userId — trajectoire du jour pour un technicien
app.get('/location/history/:userId', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT lat, lng, recorded_at FROM tech_location_history
      WHERE user_id=$1 AND recorded_at > NOW()-INTERVAL '24 hours'
      ORDER BY recorded_at ASC`,
      [req.params.userId]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

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
    const { siteCode, siteName, gpsLat, gpsLng } = req.body;
    const userQ = await pool.query('SELECT "firstName","lastName",role FROM users WHERE id=$1',[req.user.sub]);
    const u = userQ.rows[0];
    const isTerrain = ['technician','terrain'].includes(u.role);

    // Toggle automatique fiable — basé sur le dernier pointage du jour en DB, jamais sur un état client périmé
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const lastToday = await pool.query(
      `SELECT type FROM pointages WHERE user_id=$1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1`,
      [req.user.sub, todayStart.toISOString()]
    );
    const lastType = lastToday.rows[0]?.type;
    const type = lastType==='arrivee' ? 'depart' : 'arrivee';

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
       type, gpsLat||null, gpsLng||null,
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
app.post('/push/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if(!subscription) return res.status(400).json({ message: 'Subscription requise' });
    // Utiliser l'userId depuis le token JWT (fiable) ou fallback sur le body
    const userId = req.user?.sub || (req.body.userId && !isNaN(parseInt(req.body.userId)) ? parseInt(req.body.userId) : null);
    if(!userId) return res.status(400).json({ message: 'Utilisateur non identifié' });
    // Supprimer l'ancienne subscription de cet user
    await pool.query('DELETE FROM push_subscriptions WHERE user_id=$1',[userId]).catch(()=>{});
    await pool.query(
      'INSERT INTO push_subscriptions (user_id,subscription) VALUES ($1,$2)',
      [userId, JSON.stringify(subscription)]
    );
    res.json({ ok: true, message: 'Notification push activée', userId });
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

// ─── APPELS AUDIO/VIDÉO — notification d'appel entrant ─────────
pool.query(`CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  caller_id INTEGER REFERENCES users(id),
  caller_name VARCHAR(100),
  callee_id INTEGER REFERENCES users(id),
  type VARCHAR(10) DEFAULT 'video',
  room VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'ringing',
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP
)`).catch(console.error);

// POST /calls/initiate — démarrer un appel et notifier le destinataire
app.post('/calls/initiate', auth, async (req, res) => {
  try {
    const { calleeId, type, room } = req.body;
    if(!calleeId || !room) return res.status(400).json({ message: 'calleeId et room requis' });
    const u = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const callerName = u.rows[0] ? `${u.rows[0].firstName} ${u.rows[0].lastName}` : 'Quelqu\'un';
    const call = await pool.query(
      `INSERT INTO calls (caller_id, caller_name, callee_id, type, room, status)
       VALUES ($1,$2,$3,$4,$5,'ringing') RETURNING *`,
      [req.user.sub, callerName, calleeId, type||'video', room]
    );
    res.status(201).json(call.rows[0]);

    // Notifier le destinataire (async, sans bloquer)
    (async () => {
      try {
        const subs = await pool.query('SELECT id, subscription FROM push_subscriptions WHERE user_id=$1',[calleeId]);
        const payload = JSON.stringify({
          title: (type==='audio'?'📞 ':'📹 ') + callerName,
          body: `${type==='audio'?'Appel audio':'Appel vidéo'} entrant — répondez dans CleanIT Comm`,
          url: '/mobile',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          tag: 'call-'+call.rows[0].id,
          renotify: true,
          data: { type:'call', callId: call.rows[0].id, room, callerName, callType: type },
        });
        for (const row of subs.rows) {
          try { await webpush.sendNotification(JSON.parse(row.subscription), payload); }
          catch(e) { if(e.statusCode===410||e.statusCode===404) await pool.query('DELETE FROM push_subscriptions WHERE id=$1',[row.id]).catch(()=>{}); }
        }
      } catch(e) { console.error('Call push error:', e.message); }
    })();
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// GET /calls/incoming — polling léger pour savoir si un appel arrive (fallback si push échoue)
app.get('/calls/incoming', auth, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM calls WHERE callee_id=$1 AND status='ringing' AND created_at > NOW()-INTERVAL '120 seconds' ORDER BY created_at DESC LIMIT 1`,
      [req.user.sub]
    );
    res.json(r.rows[0]||null);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// POST /calls/:id/respond — accepter ou refuser un appel
app.post('/calls/:id/respond', auth, async (req, res) => {
  try {
    const { accepted } = req.body;
    const r = await pool.query(
      `UPDATE calls SET status=$1, responded_at=NOW() WHERE id=$2 RETURNING *`,
      [accepted ? 'accepted' : 'declined', req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// POST /calls/:id/end — marquer un appel terminé / manqué
app.post('/calls/:id/end', auth, async (req, res) => {
  try {
    const call = await pool.query('SELECT status FROM calls WHERE id=$1',[req.params.id]);
    const finalStatus = call.rows[0]?.status==='ringing' ? 'missed' : 'ended';
    const r = await pool.query(`UPDATE calls SET status=$1 WHERE id=$2 RETURNING *`,[finalStatus, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// GET /calls/history — historique des appels (passés, reçus, manqués) pour l'utilisateur connecté
app.get('/calls/history', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT c.*,
        CASE WHEN c.caller_id=$1 THEN cu."firstName"||' '||cu."lastName" ELSE c.caller_name END as caller_display,
        CASE WHEN c.caller_id=$1 THEN 'outgoing' ELSE 'incoming' END as direction
      FROM calls c
      LEFT JOIN users cu ON cu.id = c.callee_id
      WHERE c.caller_id=$1 OR c.callee_id=$1
      ORDER BY c.created_at DESC LIMIT 50`,
      [req.user.sub]
    );
    res.json(r.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// POST /calls/daily-room — créer (ou réutiliser) une room Daily.co pour un appel
// La clé API reste côté serveur, jamais exposée au client
app.post('/calls/daily-room', auth, async (req, res) => {
  try {
    const { roomName } = req.body;
    if(!roomName) return res.status(400).json({ message: 'roomName requis' });
    const TEAM_ID = process.env.DIGITALSAMBA_TEAM_ID;
    const DEV_KEY = process.env.DIGITALSAMBA_DEV_KEY;
    if(!TEAM_ID || !DEV_KEY) return res.status(500).json({ message: 'DIGITALSAMBA_TEAM_ID / DIGITALSAMBA_DEV_KEY non configurées côté serveur' });

    const auth64 = Buffer.from(`${TEAM_ID}:${DEV_KEY}`).toString('base64');
    const authHeader = { 'Authorization': 'Basic '+auth64, 'Content-Type': 'application/json' };

    // Lister les rooms existantes pour réutiliser celle-ci si elle existe déjà
    const listResp = await fetch(`https://api.digitalsamba.com/api/v1/rooms?limit=100`, { headers: authHeader });
    if(listResp.ok) {
      const listData = await listResp.json();
      const existing = (listData.data||listData||[]).find(r => r.friendly_url === roomName || r.external_id === roomName);
      if(existing) return res.json({ url: existing.room_url, name: roomName });
    }

    // Créer la room — auto-expire après inactivité, pas de moderation requise
    const createResp = await fetch('https://api.digitalsamba.com/api/v1/rooms', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({
        privacy: 'public',
        friendly_url: roomName,
        external_id: roomName,
        session_length: 60, // session max 60 min
      })
    });
    const created = await createResp.json();
    if(!createResp.ok) return res.status(500).json({ message: 'Erreur Digital Samba', error: created });
    res.json({ url: created.room_url, name: roomName });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});


// ─── CONVERSATIONS & MESSAGES ─────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  participant_1 INTEGER REFERENCES users(id),
  participant_2 INTEGER REFERENCES users(id),
  last_message TEXT,
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  from_id INTEGER REFERENCES users(id),
  from_name VARCHAR(100),
  text TEXT,
  photo_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

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

// GET /conversations/list — liste des conversations avec nb messages non lus
app.get('/conversations/list', auth, async (req, res) => {
  try {
    const myId = req.user.sub;
    const result = await pool.query(`
      SELECT c.id, c.participant_1, c.participant_2, c.last_message, c.last_message_at,
        u."firstName", u."lastName", u.email, u.role, u.last_seen,
        CASE WHEN u.last_seen > NOW()-INTERVAL '5 minutes' THEN 'online'
             WHEN u.last_seen > NOW()-INTERVAL '30 minutes' THEN 'away'
             ELSE 'offline' END as status,
        (SELECT COUNT(*) FROM messages m
         WHERE m.conversation_id=c.id AND m.from_id!=$1 AND m.read=false) as unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.participant_1=$1 THEN c.participant_2 ELSE c.participant_1 END
      WHERE c.participant_1=$1 OR c.participant_2=$1
      ORDER BY c.last_message_at DESC NULLS LAST
    `, [myId]);
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
    const senderName = (u.firstName||'')+(u.lastName?' '+u.lastName:'');
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, from_id, from_name, text, photo_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [conversationId, req.user.sub, senderName, text||null, photoUrl||null]
    );
    await pool.query('UPDATE conversations SET last_message=$1, last_message_at=NOW() WHERE id=$2',[text||'Photo', conversationId]);
    res.status(201).json(result.rows[0]);

    // Envoyer notification push au destinataire (async, sans bloquer la réponse)
    (async () => {
      try {
        // Trouver l'autre participant de la conversation
        const conv = await pool.query('SELECT participant_1, participant_2 FROM conversations WHERE id=$1',[conversationId]);
        if (!conv.rows[0]) return;
        const { participant_1, participant_2 } = conv.rows[0];
        const recipientId = String(participant_1) === String(req.user.sub) ? participant_2 : participant_1;
        // Chercher sa subscription push
        const subs = await pool.query('SELECT id, subscription FROM push_subscriptions WHERE user_id=$1',[recipientId]);
        if (!subs.rows.length) return;
        const payload = JSON.stringify({
          title: '💬 ' + senderName,
          body: text ? (text.length > 60 ? text.slice(0,60)+'…' : text) : '📷 Photo',
          url: '/mobile',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          tag: 'msg-conv-'+conversationId,
          renotify: true,
        });
        for (const row of subs.rows) {
          try {
            await webpush.sendNotification(JSON.parse(row.subscription), payload);
          } catch(e) {
            if (e.statusCode === 410 || e.statusCode === 404) {
              await pool.query('DELETE FROM push_subscriptions WHERE id=$1',[row.id]).catch(()=>{});
            }
          }
        }
      } catch(e) { console.error('Push message error:', e.message); }
    })();
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});




// ─── APPROVALS DUID & PROJECT AUDIT ──────────────────────────
// Migration colonne duid dans sites
pool.query('ALTER TABLE sites ADD COLUMN IF NOT EXISTS duid VARCHAR(100)').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS duid VARCHAR(100)').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS request_type VARCHAR(80)').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT \'normale\'').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS label VARCHAR(200)').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS detail TEXT').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS n1_done BOOLEAN DEFAULT false').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS n2_done BOOLEAN DEFAULT false').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS dg_done BOOLEAN DEFAULT false').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS user_id INTEGER').catch(()=>{});
pool.query('ALTER TABLE approvals ADD COLUMN IF NOT EXISTS user_name VARCHAR(100)').catch(()=>{});

// GET /projects/for-approvals — projets actifs avec DUIDs
app.get('/projects/for-approvals', auth, async (req, res) => {
  try {
    const sites = await pool.query(
      'SELECT id,code,name,duid,"poNumber",region,ville,status FROM sites WHERE status NOT IN (\'completed\',\'cancelled\') ORDER BY name'
    );
    // Grouper par poNumber (projet)
    const projects = {};
    for(const s of sites.rows){
      const key = s.poNumber||s.code;
      if(!projects[key]) projects[key]={poNumber:s.poNumber||s.code,sites:[]};
      projects[key].sites.push({id:s.id,code:s.code,name:s.name,duid:s.duid||s.code,region:s.region,ville:s.ville,status:s.status});
    }
    res.json(Object.values(projects));
  } catch(e){ res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

// GET /projects/duid/:duid — infos d'un site par DUID sans budget
app.get('/projects/duid/:duid', auth, async (req, res) => {
  try {
    const {duid} = req.params;
    // Chercher par duid ou par code
    const r = await pool.query(
      'SELECT id,code,name,duid,"poNumber",region,ville,technology,status,"typeTravauxEnum" FROM sites WHERE duid=$1 OR code=$1 LIMIT 1',
      [duid]
    );
    if(!r.rows[0]) return res.status(404).json({message:'DUID non trouvé'});
    const site = r.rows[0];
    // Récupérer les demandes liées sans montants confidentiels
    const approvals = await pool.query(
      'SELECT id,type,label,description,status,submitted_by,user_name,"createdAt",amount,request_type FROM approvals WHERE "siteCode"=$1 OR duid=$1 ORDER BY "createdAt" DESC',
      [site.code]
    );
    res.json({
      site: {
        id:site.id, code:site.code, name:site.name,
        duid:site.duid||site.code, poNumber:site.poNumber,
        region:site.region, ville:site.ville,
        technology:site.technology, status:site.status,
        typeTravauxEnum:site.typeTravauxEnum,
      },
      approvals_count: approvals.rows.length,
      approvals_pending: approvals.rows.filter(a=>a.status==='pending').length,
    });
  } catch(e){ res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

// GET /approvals/audit/duid/:duid — audit complet par DUID
app.get('/approvals/audit/duid/:duid', auth, async (req, res) => {
  try {
    const {duid} = req.params;
    const site = await pool.query('SELECT code,name,duid,"poNumber" FROM sites WHERE duid=$1 OR code=$1 LIMIT 1',[duid]);
    const siteCode = site.rows[0]?.code||duid;
    const r = await pool.query(
      `SELECT a.id,a.type,a.label,a.description,a.status,a.amount,a.currency,
        a.submitted_by,a.user_name,a."createdAt",a."updatedAt",
        a.request_type,a.justification,a."beneficiaryName",a."paymentMethod",
        a.n1_done,a.n2_done,a.dg_done,a.history
       FROM approvals a
       WHERE a."siteCode"=$1 OR a.duid=$1
       ORDER BY a."createdAt" DESC`,
      [siteCode]
    );
    const rows = r.rows;
    const total_engage = rows.filter(a=>['approved','paid'].includes(a.status)).reduce((s,a)=>s+Number(a.amount||0),0);
    const total_pending = rows.filter(a=>a.status==='pending').reduce((s,a)=>s+Number(a.amount||0),0);
    res.json({
      duid, site: site.rows[0]||null,
      summary:{total:rows.length, approved:rows.filter(a=>a.status==='approved'||a.status==='paid').length, pending:rows.filter(a=>a.status==='pending').length, rejected:rows.filter(a=>a.status==='rejected').length, total_engage, total_pending},
      approvals: rows
    });
  } catch(e){ res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

// GET /approvals/audit/project/:poNumber — audit complet par projet
app.get('/approvals/audit/project/:poNumber', auth, async (req, res) => {
  try {
    const {poNumber} = req.params;
    // Tous les sites du projet
    const sites = await pool.query('SELECT code,name,duid FROM sites WHERE "poNumber"=$1',[poNumber]);
    const siteCodes = sites.rows.map(s=>s.code);
    if(siteCodes.length===0) return res.json({poNumber,sites:[],summary:{total:0},approvals:[]});
    const r = await pool.query(
      `SELECT a.*,s.name as site_name,s.duid as site_duid
       FROM approvals a
       LEFT JOIN sites s ON s.code=a."siteCode"
       WHERE a."siteCode"=ANY($1)
       ORDER BY a."createdAt" DESC`,
      [siteCodes]
    );
    const rows = r.rows;
    // Grouper par site
    const bySite = {};
    for(const s of sites.rows) bySite[s.code]={site:s,approvals:[],total_engage:0,total_pending:0};
    for(const a of rows){
      if(bySite[a.siteCode]){
        bySite[a.siteCode].approvals.push(a);
        if(['approved','paid'].includes(a.status)) bySite[a.siteCode].total_engage+=Number(a.amount||0);
        if(a.status==='pending') bySite[a.siteCode].total_pending+=Number(a.amount||0);
      }
    }
    const total_engage = rows.filter(a=>['approved','paid'].includes(a.status)).reduce((s,a)=>s+Number(a.amount||0),0);
    res.json({
      poNumber, sites_count:sites.rows.length,
      summary:{total:rows.length, approved:rows.filter(a=>['approved','paid'].includes(a.status)).length, pending:rows.filter(a=>a.status==='pending').length, total_engage},
      by_site: Object.values(bySite),
      approvals: rows
    });
  } catch(e){ res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

// ─── WORKFLOWS D'APPROBATION — persistance configuration ──────
pool.query(`CREATE TABLE IF NOT EXISTS approval_workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  types JSONB DEFAULT '[]',
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).then(async () => {
  // Insérer les 2 workflows par défaut s'ils n'existent pas encore
  const existing = await pool.query(`SELECT COUNT(*) FROM approval_workflows`).catch(()=>({rows:[{count:'1'}]}));
  if(parseInt(existing.rows[0]?.count||'1') === 0) {
    await pool.query(`INSERT INTO approval_workflows (name, types, steps) VALUES
      ('Workflow par défaut',
       '["achat_materiel","transport","paiement_prestataire","frais_mission","location_engin","frais_douane","hebergement","paiement_technicien","avance_salaire","formation","autre"]',
       '[{"id":"n1","label":"Responsable direct (N1)","role":"project_manager","amtMin":0,"amtMax":null,"required":true},
         {"id":"n2","label":"Directeur Général (DG)","role":"dg","amtMin":0,"amtMax":null,"required":true}]'),
      ('Workflow Congés RH',
       '["conge"]',
       '[{"id":"n1","label":"RH Manager (N1)","role":"hr","amtMin":0,"amtMax":null,"required":true},
         {"id":"n2","label":"Directeur Général (DG)","role":"dg","amtMin":500000,"amtMax":null,"required":false}]')
    `).catch(console.error);
  }
}).catch(console.error);

app.get('/approval-workflows', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM approval_workflows ORDER BY id ASC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/approval-workflows', auth, async (req, res) => {
  try {
    const { name, types, steps } = req.body;
    const r = await pool.query(
      'INSERT INTO approval_workflows (name, types, steps) VALUES ($1,$2,$3) RETURNING *',
      [name||'Nouveau workflow', JSON.stringify(types||[]), JSON.stringify(steps||[])]
    );
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.put('/approval-workflows/:id', auth, async (req, res) => {
  try {
    const { name, types, steps } = req.body;
    const r = await pool.query(
      `UPDATE approval_workflows SET
        name=COALESCE($1,name), types=COALESCE($2,types), steps=COALESCE($3,steps), updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, types?JSON.stringify(types):null, steps?JSON.stringify(steps):null, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.delete('/approval-workflows/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM approval_workflows WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});


pool.query(`CREATE TABLE IF NOT EXISTS bons_commande (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(100) NOT NULL,
  client VARCHAR(200),
  site_code VARCHAR(50),
  duid VARCHAR(100),
  po_number VARCHAR(100),
  project_code VARCHAR(100),
  project_name VARCHAR(200),
  site_id VARCHAR(100),
  region VARCHAR(100),
  devise VARCHAR(10) DEFAULT 'FCFA',
  description TEXT,
  notes TEXT,
  status VARCHAR(30) DEFAULT 'en_cours',
  lignes JSONB DEFAULT '[]',
  montant_total NUMERIC(15,2) DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);
// Ajouter les colonnes manquantes si la table existait déjà avant cette mise à jour
pool.query('ALTER TABLE bons_commande ADD COLUMN IF NOT EXISTS project_code VARCHAR(100)').catch(()=>{});
pool.query('ALTER TABLE bons_commande ADD COLUMN IF NOT EXISTS project_name VARCHAR(200)').catch(()=>{});
pool.query('ALTER TABLE bons_commande ADD COLUMN IF NOT EXISTS site_id VARCHAR(100)').catch(()=>{});
pool.query('ALTER TABLE bons_commande ADD COLUMN IF NOT EXISTS region VARCHAR(100)').catch(()=>{});

// Colonne last_seen pour statut en ligne
pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP').catch(()=>{});

// Middleware last_seen
app.use((req,res,next)=>{
  if(req.user?.sub){
    pool.query('UPDATE users SET last_seen=NOW(), "lastSeen"=NOW() WHERE id=$1',[req.user.sub]).catch(()=>{});
  }
  next();
});

app.get('/bons-commande', auth, async (req,res)=>{
  try{
    const r = await pool.query('SELECT * FROM bons_commande ORDER BY created_at DESC');
    res.json(r.rows);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.post('/bons-commande', auth, async (req,res)=>{
  try{
    const {numero,client,siteCode,duid,poNumber,devise,description,notes,lignes,montantTotal,status} = req.body;
    if(!numero||!client) return res.status(400).json({message:'Numéro et client requis'});
    // Mettre à jour le DUID du site si fourni
    if(siteCode&&duid){
      await pool.query('UPDATE sites SET duid=$1 WHERE code=$2',[duid,siteCode]).catch(()=>{});
    }
    const r = await pool.query(
      `INSERT INTO bons_commande (numero,client,site_code,duid,po_number,devise,description,notes,lignes,montant_total,status,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [numero,client,siteCode||'',duid||'',poNumber||'',devise||'FCFA',description||'',notes||'',
       JSON.stringify(lignes||[]),montantTotal||0,status||'en_cours',req.user.sub]
    );
    res.status(201).json(r.rows[0]);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.put('/bons-commande/:id', auth, async (req,res)=>{
  try{
    const {status,notes,lignes,montantTotal} = req.body;
    const sets=[]; const vals=[];
    if(status!==undefined){sets.push(`status=$${vals.length+1}`);vals.push(status);}
    if(notes!==undefined){sets.push(`notes=$${vals.length+1}`);vals.push(notes);}
    if(lignes!==undefined){sets.push(`lignes=$${vals.length+1}`);vals.push(JSON.stringify(lignes));}
    if(montantTotal!==undefined){sets.push(`montant_total=$${vals.length+1}`);vals.push(montantTotal);}
    if(!sets.length) return res.status(400).json({message:'Rien à mettre à jour'});
    sets.push(`updated_at=NOW()`);
    vals.push(req.params.id);
    const r = await pool.query(`UPDATE bons_commande SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`,vals);
    res.json(r.rows[0]);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

// Import BC depuis ChaCha — met à jour sites avec DUID
app.post('/bons-commande/import', auth, async (req,res)=>{
  try{
    const {numero,client,siteCode,duid,poNumber,devise,lignes,description} = req.body;
    // Créer ou mettre à jour le site avec DUID
    if(siteCode){
      const existing = await pool.query('SELECT id FROM sites WHERE code=$1',[siteCode]);
      if(existing.rows[0]){
        await pool.query('UPDATE sites SET duid=$1,"poNumber"=$2 WHERE code=$3',[duid||siteCode,poNumber||'',siteCode]);
      } else {
        await pool.query(
          `INSERT INTO sites (code,name,duid,"poNumber",status) VALUES ($1,$2,$3,$4,'en_cours')`,
          [siteCode,siteCode,duid||siteCode,poNumber||'']
        ).catch(()=>{});
      }
    }
    const montantTotal = (lignes||[]).reduce((s,l)=>s+((l.qte||0)*(l.puBC||l.pu||0)),0);
    const r = await pool.query(
      `INSERT INTO bons_commande (numero,client,site_code,duid,po_number,devise,description,lignes,montant_total,status,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'en_cours',$10) RETURNING *`,
      [numero||'BC-'+Date.now(),client||'',siteCode||'',duid||siteCode||'',poNumber||'',
       devise||'FCFA',description||'',JSON.stringify(lignes||[]),montantTotal,req.user.sub]
    );
    res.status(201).json({bc:r.rows[0],message:'BC importé et site mis à jour'});
  }catch(e){res.status(500).json({message:'Erreur import',error:e.message});}
});

// GET /users/online — statut réel basé sur last_seen
app.get('/users/online', auth, async (req,res)=>{
  try{
    const r = await pool.query(`
      SELECT id, "firstName", "lastName", role, email, last_seen,
        CASE WHEN last_seen > NOW()-INTERVAL '5 minutes' THEN 'online'
             WHEN last_seen > NOW()-INTERVAL '30 minutes' THEN 'away'
             ELSE 'offline' END as status
      FROM users WHERE "isActive"=true OR "isActive" IS NULL
      ORDER BY last_seen DESC NULLS LAST
    `);
    res.json(r.rows);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

// POST /approvals/:id/approve-final — approbation finale → écriture CleanITBooks
app.post('/approvals/:id/approve-final', auth, async (req,res)=>{
  try{
    const {comment} = req.body;
    const appr = await pool.query('SELECT * FROM approvals WHERE id=$1',[req.params.id]);
    if(!appr.rows[0]) return res.status(404).json({message:'Introuvable'});
    const a = appr.rows[0];
    const uQ = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const u = uQ.rows[0];
    const by = ((u?.firstName||'')+' '+(u?.lastName||'')).trim();
    const hist = JSON.parse(a.history||'[]');
    hist.push({action:'Approuvé — Direction Générale',by,at:new Date().toISOString(),comment:comment||''});
    // Mettre à jour approval
    await pool.query(
      `UPDATE approvals SET status='approved',dg_done=true,dg_by=$1,dg_at=NOW(),dg_comment=$2,
       history=$3,"approvedBy"=$4,"approvedAt"=NOW(),"updatedAt"=NOW() WHERE id=$5`,
      [by,comment||'',JSON.stringify(hist),by,req.params.id]
    );
    // Créer écriture comptable dans CleanITBooks si montant > 0
    if(Number(a.amount)>0){
      await pool.query(`
        CREATE TABLE IF NOT EXISTS cib_entries (
          id SERIAL PRIMARY KEY, approval_id INTEGER, type VARCHAR(50),
          label VARCHAR(200), amount NUMERIC(15,2), currency VARCHAR(10),
          site_code VARCHAR(50), project_code VARCHAR(50),
          beneficiary VARCHAR(200), status VARCHAR(20) DEFAULT 'pending_payment',
          created_at TIMESTAMP DEFAULT NOW()
        )`).catch(()=>{});
      await pool.query(
        `INSERT INTO cib_entries (approval_id,type,label,amount,currency,site_code,project_code,beneficiary)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [a.id, a.type||a.request_type||'expense', a.label||a.description||'Dépense approuvée',
         Number(a.amount), a.currency||'FCFA', (a.siteCode||a.site_code||''),
         (a.projectCode||a.project_code||''), (a.beneficiaryName||a.beneficiary_name||'')]
      ).catch(()=>{});
    }
    const updated = await pool.query('SELECT * FROM approvals WHERE id=$1',[req.params.id]);
    const approved = updated.rows[0];

    // ── Liaisons Planning automatiques selon le type de demande ──
    (async () => {
      try {
        const siteCode = approved.site_code||approved.siteCode||'';
        const today = new Date().toISOString().split('T')[0];
        const reqType = approved.type||approved.request_type||'';

        // Scénario 4 : toute approbation DG avec site_code → jalon Planning "Payé"
        if(siteCode && Number(approved.amount)>0) {
          await pool.query(`INSERT INTO planning_events
            (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
             description,link_module,link_detail,color,created_by,created_by_name,status)
            VALUES ($1,'jalon','finance','entreprise',$2,$2,10,11,true,$3,'approvals',$4,'#6B21A8',$5,$6,'confirmed')`,
            [`Paiement validé — ${approved.label||siteCode}`,
             today,
             `Montant: ${Number(approved.amount).toLocaleString('fr-FR')} ${approved.currency||'FCFA'} · Bénéficiaire: ${approved.beneficiary_name||approved.beneficiaryName||'—'}`,
             `approval:${approved.id}`, req.user.sub, by]).catch(()=>{});
        }

        // Scénario 3 : congé approuvé → bloc Planning (indisponibilité technicien)
        if(['conge','leave_request'].includes(reqType)) {
          const startDate = approved.start_date||today;
          const endDate   = approved.end_date||today;
          await pool.query(`INSERT INTO planning_events
            (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
             description,link_module,link_detail,color,created_by,created_by_name,status,tech_ids)
            VALUES ($1,'conge','rh','entreprise',$2,$3,8,17,true,$4,'approvals',$5,'#E76500',$6,$7,'confirmed',$8)`,
            [`Congé — ${approved.user_name||'Employé'}`, startDate, endDate,
             `Congé validé par ${by}. Technicien indisponible sur cette période.`,
             `approval:${approved.id}`, req.user.sub, by,
             JSON.stringify(approved.user_id?[String(approved.user_id)]:[])]).catch(()=>{});
        }

        // Scénario 5 : avance sur salaire → rappel Planning RH
        if(['avance_salaire','advance_request'].includes(reqType)) {
          await pool.query(`INSERT INTO planning_events
            (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
             description,link_module,link_detail,color,created_by,created_by_name,status)
            VALUES ($1,'echeance','rh','equipe',$2,$2,9,10,false,$3,'approvals',$4,'#E76500',$5,$6,'confirmed')`,
            [`Avance salaire — ${approved.user_name||'Employé'} (${Number(approved.amount||0).toLocaleString('fr-FR')} FCFA)`,
             today, `Avance validée. À déduire du prochain bulletin de paie.`,
             `approval:${approved.id}`, req.user.sub, by]).catch(()=>{});
        }

        // Scénario 6 : formation approuvée → event Planning
        if(['formation','training_request'].includes(reqType)) {
          const startDate = approved.start_date||today;
          const endDate   = approved.end_date||startDate;
          await pool.query(`INSERT INTO planning_events
            (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
             description,link_module,link_detail,color,created_by,created_by_name,status)
            VALUES ($1,'formation','terrain','entreprise',$2,$3,8,17,true,$4,'approvals',$5,'#0F766E',$6,$7,'confirmed')`,
            [`Formation — ${approved.label||'Formation approuvée'}`, startDate, endDate,
             `Formation approuvée. Coût: ${Number(approved.amount||0).toLocaleString('fr-FR')} ${approved.currency||'FCFA'}`,
             `approval:${approved.id}`, req.user.sub, by]).catch(()=>{});
        }
      } catch(e) { console.error('Planning auto-event error:', e.message); }
    })();

    res.json(approved);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});


// ─── PURCHASE ORDERS (BonsCommande PurchaseOrders) ───────────
app.get('/purchase-orders', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM bons_commande ORDER BY created_at DESC');
    res.json(r.rows);
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

app.post('/purchase-orders', auth, async (req, res) => {
  try {
    const {numero,client,siteCode,duid,poNumber,devise,description,notes,lignes,montantTotal,status} = req.body;
    if(!numero||!client) return res.status(400).json({message:'Numéro et client requis'});
    if(siteCode&&duid){
      await pool.query('UPDATE sites SET duid=$1 WHERE code=$2',[duid,siteCode]).catch(()=>{});
    }
    const r = await pool.query(
      `INSERT INTO bons_commande (numero,client,site_code,duid,po_number,devise,description,notes,lignes,montant_total,status,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [numero,client,siteCode||'',duid||'',poNumber||'',devise||'FCFA',
       description||'',notes||'',JSON.stringify(lignes||[]),montantTotal||0,
       status||'en_cours',req.user.sub]
    );
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

app.post('/purchase-orders/import', auth, upload.single('file'), async (req, res) => {
  try {
    let rows = [];
    if(req.file) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.worksheets[0];
      if(!ws) return res.status(400).json({message:'Feuille Excel vide'});
      // Trouver la ligne des headers automatiquement
      const KEY_WORDS = ['po','site_code','site code','duid','description','qty','quantit','requested','numero','bon de commande'];
      let headerRow = 1; let headers = [];
      ws.eachRow((row, rowNum) => {
        if(headers.length > 0) return;
        const cells = []; row.eachCell((cell,col)=>{ cells[col]=String(cell.value||'').toLowerCase().trim(); });
        const matchCount = KEY_WORDS.filter(kw=>cells.join(' ').includes(kw)).length;
        if(matchCount >= 2) { headerRow = rowNum; headers = cells; }
      });
      if(headers.length === 0) { // fallback: première ligne non vide
        ws.eachRow((row,rowNum)=>{ if(headers.length>0) return; const cells=[]; row.eachCell((cell,col)=>{cells[col]=String(cell.value||'').toLowerCase().trim();}); if(cells.some(c=>c&&c.length>0)){headerRow=rowNum;headers=cells;} });
      }
      ws.eachRow((row,rowNum)=>{ if(rowNum<=headerRow) return; const obj={}; row.eachCell((cell,col)=>{ if(headers[col]) obj[headers[col]]=cell.value; }); if(Object.values(obj).some(v=>v!==null&&v!==undefined&&String(v).trim()!=='')) rows.push(obj); });
    }
    if(rows.length===0) return res.status(400).json({message:'Aucune donnée trouvée. Vérifiez que le fichier a des en-têtes reconnaissables (po, site_code, description, qty...)'});
    // Grouper les lignes par (po + site_code) → 1 BC avec toutes ses lignes
    const groups = {};
    for(const row of rows) {
      const po = String(row['po']||row['po number']||row['n° bc']||row['numero']||row['bon de commande']||'').trim();
      const siteCode = String(row['site_code']||row['site code']||row['duid']||row['site id']||row['code site']||'').trim();
      const key = (po||'BC')+'|'+(siteCode||'SITE');
      if(!groups[key]) groups[key]={po,siteCode,siteName:String(row['site_name']||row['site name']||row['nom site']||row['nom du site']||siteCode||'').trim(),client:String(row['client']||'').trim(),projectCode:String(row['project_code']||row['project code']||row['code projet']||'').trim(),projectName:String(row['project_name']||row['project name']||row['projet']||row['nom du projet']||'').trim(),region:String(row['region']||'').trim(),lignes:[]};
      const desc = String(row['description']||row['description de la prestation']||row['scope']||'').trim();
      const ref = String(row['réf. équipement']||row['ref']||row['reference']||'').trim();
      const qty = parseFloat(row['qty']||row['qté']||row['quantite']||row['quantité']||row['requested']||1)||1;
      const unit = String(row['unité']||row['unit']||'unité').trim();
      const unitPrice = parseFloat(row['prix unitaire (fcfa)']||row['prix unitaire']||row['unit_price']||row['prix']||0)||0;
      const amount = parseFloat(row['montant (fcfa)']||row['montant']||row['amount']||0)||(qty*unitPrice);
      if(desc||ref) groups[key].lignes.push({description:desc,ref,qty,unit,unitPrice,amount});
    }
    const imported=[];
    for(const [,g] of Object.entries(groups)) {
      const {po,siteCode,siteName,client,projectCode,projectName,region,lignes}=g;
      if(!po&&!siteCode) continue;
      const ref=po||('BC-'+Date.now().toString().slice(-6));
      const totalHT=lignes.reduce((s,l)=>s+(l.amount||0),0);
      if(siteCode) {
        const existing=await pool.query('SELECT id FROM sites WHERE code=$1',[siteCode]);
        if(existing.rows[0]) await pool.query('UPDATE sites SET name=$1,"poNumber"=$2,region=$3 WHERE code=$4',[siteName||siteCode,po,region,siteCode]).catch(()=>{});
        else await pool.query(`INSERT INTO sites (code,name,"poNumber",region,duid,status,latitude,longitude,technology) VALUES ($1,$2,$3,$4,$5,'en_cours',0,0,'4G/5G')`,[siteCode,siteName||siteCode,po,region,siteCode]).catch(()=>{});
      }
      const r=await pool.query(`INSERT INTO bons_commande (numero,client,site_code,duid,po_number,project_code,project_name,site_id,region,description,lignes,montant_total,status,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'en_cours',$13) ON CONFLICT DO NOTHING RETURNING *`,[ref,client||projectName||'',siteCode,siteCode,po,projectCode,projectName,siteCode,region,projectName||projectCode,JSON.stringify(lignes),totalHT,req.user.sub]).catch(()=>({rows:[]}));
      if(r.rows[0]) imported.push({...r.rows[0],lignes_count:lignes.length,total:totalHT});
    }
    res.status(201).json({success:true,imported:imported.length,total:Object.keys(groups).length,details:imported,message:`${imported.length} BC importé(s) avec ${rows.length} ligne(s) de facturation`});
  } catch(e) { console.error('Import BC error:',e); res.status(500).json({message:'Erreur import BC',error:e.message}); }
});
app.put('/purchase-orders/:id', auth, async (req, res) => {
  try {
    const {status,notes,lignes,montantTotal} = req.body;
    const sets=[]; const vals=[];
    if(status!==undefined){sets.push(`status=$${vals.length+1}`);vals.push(status);}
    if(notes!==undefined){sets.push(`notes=$${vals.length+1}`);vals.push(notes);}
    if(lignes!==undefined){sets.push(`lignes=$${vals.length+1}`);vals.push(JSON.stringify(lignes));}
    if(montantTotal!==undefined){sets.push(`montant_total=$${vals.length+1}`);vals.push(montantTotal);}
    if(!sets.length) return res.status(400).json({message:'Rien à mettre à jour'});
    sets.push('updated_at=NOW()');
    vals.push(req.params.id);
    const r = await pool.query(
      `UPDATE bons_commande SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
});


// Migration colonnes RH dans users
const migrateUsers = async () => {
  const cols = [
    ['phone','VARCHAR(30)'],['department','VARCHAR(100)'],
    ['salary','NUMERIC(12,2)'],['contract','VARCHAR(20)'],
    ['city','VARCHAR(50)'],['address','TEXT'],
    ['bank','VARCHAR(100)'],['rib','VARCHAR(100)'],
    ['matricule','VARCHAR(50)'],['education','VARCHAR(100)'],
    ['gender','VARCHAR(10)'],['birth_date','DATE'],
    ['birth_place','VARCHAR(100)'],['nationality','VARCHAR(50)'],
    ['cin','VARCHAR(50)'],['emergency_name','VARCHAR(100)'],
    ['emergency_phone','VARCHAR(30)'],['emergency_link','VARCHAR(50)'],
    ['speciality','VARCHAR(200)'],['daily_rate','NUMERIC(12,2)'],
    ['certifications',"JSONB DEFAULT '[]'"],['hire_date','DATE'],
  ];
  for(const [col,def] of cols){
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col} ${def}`).catch(()=>{});
  }
};
migrateUsers();


// ─── TECHNICIENS ─────────────────────────────────────────────
app.get('/technicians', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT id, "firstName", "lastName", email, phone, role,
        department, speciality, daily_rate, certifications,
        city, bank, rib, matricule, "isActive", last_seen,
        CASE WHEN last_seen > NOW()-INTERVAL '5 minutes' THEN 'online'
             WHEN last_seen > NOW()-INTERVAL '30 minutes' THEN 'away'
             ELSE 'offline' END as status
      FROM users
      WHERE role IN ('technician','terrain')
      ORDER BY "firstName" ASC
    `);
    const techs = r.rows.map(u=>({
      id: u.id,
      name: (u.firstName||'')+(u.lastName?' '+u.lastName:''),
      initials: ((u.firstName||'')[0]||'')+(((u.lastName||'')[0])||''),
      role: u.speciality||'Technicien',
      region: u.city||'Douala',
      phone: u.phone||'',
      email: u.email||'',
      bank: u.bank||'',
      rib: u.rib||'',
      matricule: u.matricule||'',
      dailyRate: u.daily_rate||0,
      statut: u.status==='online'?'En mission':'Disponible',
      isActive: u.isActive,
      certs: Array.isArray(u.certifications)?u.certifications:
             (typeof u.certifications==='string'&&u.certifications?JSON.parse(u.certifications):[]),
    }));
    res.json(techs);
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

app.put('/technicians/:id/certifications', auth, async (req, res) => {
  try {
    const {certifications} = req.body;
    await pool.query('UPDATE users SET certifications=$1 WHERE id=$2',
      [JSON.stringify(certifications||[]), req.params.id]);
    res.json({success:true});
  } catch(e) { res.status(500).json({message:'Erreur serveur',error:e.message}); }
});

// 404

// ── MODULE SUIVI DE PROJETS ──────────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY, code VARCHAR(100) NOT NULL UNIQUE, name VARCHAR(200) NOT NULL,
  client VARCHAR(200), type VARCHAR(80), po_reference VARCHAR(200),
  chef_projet_id INTEGER REFERENCES users(id), status VARCHAR(30) DEFAULT 'en_cours',
  start_date DATE, target_date DATE, description TEXT,
  methodology TEXT,
  budget NUMERIC(15,2) DEFAULT 0, currency VARCHAR(10) DEFAULT 'FCFA',
  created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS methodology TEXT`).catch(()=>{});

pool.query(`CREATE TABLE IF NOT EXISTS project_sites (
  id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  site_code VARCHAR(50), site_name VARCHAR(200), region VARCHAR(100),
  status VARCHAR(30) DEFAULT 'pending', progress INTEGER DEFAULT 0,
  context TEXT, notes TEXT, added_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`ALTER TABLE project_sites ADD COLUMN IF NOT EXISTS context TEXT`).catch(()=>{});

pool.query(`CREATE TABLE IF NOT EXISTS project_steps (
  id SERIAL PRIMARY KEY, project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL, status VARCHAR(20) DEFAULT 'pending',
  responsible_id INTEGER REFERENCES users(id), target_date DATE,
  completed_at TIMESTAMP, order_index INTEGER DEFAULT 0, notes TEXT
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS project_site_phases (
  id SERIAL PRIMARY KEY,
  project_site_id INTEGER REFERENCES project_sites(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  photo_urls JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

app.get('/projects-list', auth, async (req, res) => {
  try {
    const r = await pool.query(`SELECT p.*, u."firstName"||' '||u."lastName" as chef_nom,
      COUNT(DISTINCT ps.id)::int as sites_count, ROUND(COALESCE(AVG(ps.progress),0))::int as avg_progress
      FROM projects p LEFT JOIN users u ON u.id=p.chef_projet_id
      LEFT JOIN project_sites ps ON ps.project_id=p.id
      GROUP BY p.id, u."firstName", u."lastName" ORDER BY p.created_at DESC`);
    res.json(r.rows);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.get('/projects-list/:id', auth, async (req, res) => {
  try {
    const [proj, sites, steps, missions] = await Promise.all([
      pool.query(`SELECT p.*, u."firstName"||' '||u."lastName" as chef_nom FROM projects p LEFT JOIN users u ON u.id=p.chef_projet_id WHERE p.id=$1`,[req.params.id]),
      pool.query('SELECT * FROM project_sites WHERE project_id=$1 ORDER BY added_at ASC',[req.params.id]),
      pool.query(`SELECT ps.*, u."firstName"||' '||u."lastName" as responsible_nom FROM project_steps ps LEFT JOIN users u ON u.id=ps.responsible_id WHERE ps.project_id=$1 ORDER BY order_index ASC`,[req.params.id]),
      pool.query('SELECT * FROM missions WHERE site IN (SELECT site_code FROM project_sites WHERE project_id=$1) ORDER BY created_at DESC LIMIT 20',[req.params.id]),
    ]);
    if(!proj.rows[0]) return res.status(404).json({message:'Projet introuvable'});
    // Charger les phases pour chaque site
    const sitesWithPhases = await Promise.all(sites.rows.map(async site => {
      const phases = await pool.query(
        'SELECT * FROM project_site_phases WHERE project_site_id=$1 ORDER BY order_index ASC',
        [site.id]
      ).catch(()=>({rows:[]}));
      // Photos CleanCam du Fil liées à ce site
      const photos = await pool.query(
        `SELECT photo_url, content, created_at FROM feed_posts WHERE site=$1 AND photo_url IS NOT NULL ORDER BY created_at DESC LIMIT 20`,
        [site.site_code]
      ).catch(()=>({rows:[]}));
      return {...site, phases: phases.rows, photos: photos.rows};
    }));
    res.json({...proj.rows[0], sites: sitesWithPhases, steps: steps.rows, missions: missions.rows});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/projects-list', auth, async (req, res) => {
  try {
    const {code,name,client,type,po_reference,chef_projet_id,status,start_date,target_date,description,budget,currency,sites} = req.body;
    if(!name) return res.status(400).json({message:'Nom requis'});
    const autoCode = code||('PRJ-'+Date.now().toString().slice(-6));
    const r = await pool.query(
      `INSERT INTO projects (code,name,client,type,po_reference,chef_projet_id,status,start_date,target_date,description,budget,currency,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [autoCode,name,client||'',type||'',po_reference||'',chef_projet_id||null,status||'en_cours',start_date||null,target_date||null,description||'',budget||0,currency||'FCFA',req.user.sub]
    );
    const proj = r.rows[0];
    for(const s of (sites||[])) await pool.query('INSERT INTO project_sites (project_id,site_code,site_name,region,status) VALUES ($1,$2,$3,$4,$5)',[proj.id,s.site_code||'',s.site_name||'',s.region||'',s.status||'pending']);
    res.status(201).json(proj);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/projects-list/:id', auth, async (req, res) => {
  try {
    const {name,client,type,po_reference,chef_projet_id,status,start_date,target_date,description,budget} = req.body;
    const r = await pool.query(
      `UPDATE projects SET name=COALESCE($1,name),client=COALESCE($2,client),type=COALESCE($3,type),po_reference=COALESCE($4,po_reference),chef_projet_id=COALESCE($5,chef_projet_id),status=COALESCE($6,status),start_date=COALESCE($7,start_date),target_date=COALESCE($8,target_date),description=COALESCE($9,description),budget=COALESCE($10,budget),updated_at=NOW() WHERE id=$11 RETURNING *`,
      [name,client,type,po_reference,chef_projet_id,status,start_date,target_date,description,budget,req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/projects-list/:id/sites', auth, async (req, res) => {
  try {
    const {site_code,site_name,region,status,progress,notes} = req.body;
    const r = await pool.query('INSERT INTO project_sites (project_id,site_code,site_name,region,status,progress,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[req.params.id,site_code||'',site_name||'',region||'',status||'pending',progress||0,notes||'']);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/projects-list/:id/sites/:siteId', auth, async (req, res) => {
  try {
    const {status,progress,notes} = req.body;
    const r = await pool.query('UPDATE project_sites SET status=COALESCE($1,status),progress=COALESCE($2,progress),notes=COALESCE($3,notes) WHERE id=$4 AND project_id=$5 RETURNING *',[status,progress,notes,req.params.siteId,req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/projects-list/:id/steps', auth, async (req, res) => {
  try {
    const {label,status,responsible_id,target_date,order_index,notes} = req.body;
    const r = await pool.query('INSERT INTO project_steps (project_id,label,status,responsible_id,target_date,order_index,notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[req.params.id,label,status||'pending',responsible_id||null,target_date||null,order_index||0,notes||'']);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/projects-list/:id/steps/:stepId', auth, async (req, res) => {
  try {
    const {status,notes,target_date} = req.body;
    const completedAt = status==='done'?new Date().toISOString():null;
    const r = await pool.query('UPDATE project_steps SET status=COALESCE($1,status),notes=COALESCE($2,notes),target_date=COALESCE($3,target_date),completed_at=COALESCE($4,completed_at) WHERE id=$5 AND project_id=$6 RETURNING *',[status,notes,target_date,completedAt,req.params.stepId,req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Mettre à jour la méthodologie commune d'un projet
app.put('/projects-list/:id/methodology', auth, async (req, res) => {
  try {
    const {methodology} = req.body;
    const r = await pool.query('UPDATE projects SET methodology=$1, updated_at=NOW() WHERE id=$2 RETURNING *',[methodology, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Mettre à jour le contexte d'un site
app.put('/projects-list/:id/sites/:siteId', auth, async (req, res) => {
  try {
    const {status,progress,notes,context} = req.body;
    const r = await pool.query('UPDATE project_sites SET status=COALESCE($1,status),progress=COALESCE($2,progress),notes=COALESCE($3,notes),context=COALESCE($4,context) WHERE id=$5 AND project_id=$6 RETURNING *',[status,progress,notes,context,req.params.siteId,req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Phases d'un site spécifique
app.get('/project-sites/:siteId/phases', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM project_site_phases WHERE project_site_id=$1 ORDER BY order_index ASC',[req.params.siteId]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/project-sites/:siteId/phases', auth, async (req, res) => {
  try {
    const {title, description, status, order_index} = req.body;
    if(!title) return res.status(400).json({message:'Titre de phase requis'});
    const r = await pool.query(
      'INSERT INTO project_site_phases (project_site_id,title,description,status,order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.siteId, title, description||'', status||'pending', order_index||0]
    );
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/project-sites/:siteId/phases/:phaseId', auth, async (req, res) => {
  try {
    const {title, description, status, photo_urls} = req.body;
    const r = await pool.query(
      `UPDATE project_site_phases SET
        title=COALESCE($1,title), description=COALESCE($2,description),
        status=COALESCE($3,status), photo_urls=COALESCE($4::jsonb,photo_urls)
       WHERE id=$5 AND project_site_id=$6 RETURNING *`,
      [title, description, status, photo_urls?JSON.stringify(photo_urls):null, req.params.phaseId, req.params.siteId]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.delete('/project-sites/:siteId/phases/:phaseId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_site_phases WHERE id=$1 AND project_site_id=$2',[req.params.phaseId,req.params.siteId]);
    res.json({ok:true});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// ── CATALOGUE DES TYPES DE PROJETS ───────────────────────────────────
// Chaque type de projet (IP Core, Rural Start, MPBN, DWDM...) a une définition,
// une liste de phases ordonnées, et des photos illustratives pour chaque phase.
// Ce module est une base de connaissance opérationnelle de CleanIT SARL.

pool.query(`CREATE TABLE IF NOT EXISTS project_type_catalogue (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  context TEXT,
  color VARCHAR(20) DEFAULT '#1B4F8A',
  icon VARCHAR(50) DEFAULT 'network',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS project_type_phases (
  id SERIAL PRIMARY KEY,
  project_type_id INTEGER REFERENCES project_type_catalogue(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_client_scope BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS project_phase_photos (
  id SERIAL PRIMARY KEY,
  phase_id INTEGER REFERENCES project_type_phases(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// Pré-remplir IP Core et Rural Start — vérification du NOMBRE de phases
// Si IP Core existe avec moins de 13 phases → supprimer et re-insérer
// Si Rural Start inexistant ou incomplet → insérer
(async () => {
  try {
    // ── IP CORE (13 phases) ────────────────────────────────────────
    const ipExists = await pool.query("SELECT id FROM project_type_catalogue WHERE code='ip_core'");
    let ipNeedsReset = false;
    if (ipExists.rows[0]) {
      const ipCount = await pool.query('SELECT COUNT(*) FROM project_type_phases WHERE project_type_id=$1', [ipExists.rows[0].id]);
      if (parseInt(ipCount.rows[0].count) < 13) {
        // Phases incomplètes — supprimer et re-insérer toutes les 13
        await pool.query('DELETE FROM project_type_phases WHERE project_type_id=$1', [ipExists.rows[0].id]);
        await pool.query("DELETE FROM project_type_catalogue WHERE code='ip_core'");
        ipNeedsReset = true;
        console.log('IP Core reset: phases incomplètes supprimées, ré-insertion des 13 phases...');
      }
    }
    if (!ipExists.rows[0] || ipNeedsReset) {    const ipCore = await pool.query(`INSERT INTO project_type_catalogue (code,name,category,description,context,color) VALUES ('ip_core','IP Core','Data Center & Réseau IP',
      'Déploiement d''infrastructure réseau IP dans les data centers : racks, serveurs, switchs, câblage fibre et cuivre, alimentation et connexion.',
      'Le projet IP Core est exclusivement dédié aux data centers. Il implique l''installation physique complète de l''infrastructure réseau : racks, serveurs, switchs, routeurs, câblage fibre et RJ45, alimentation et mise en service. CleanIT intervient jusqu''à la mise sous tension — la configuration logicielle est du ressort du client.',
      '#0D9488') RETURNING id`);
    const ipId = ipCore.rows[0].id;
    const ipPhases = [
      ['Appel d\'offre', 'Réception et analyse de l\'appel d\'offre du client. Étude du scope technique, chiffrage des prestations, soumission de l\'offre.', false, 0],
      ['Mails de confirmation', 'Confirmation écrite de l\'attribution du contrat. Échange des documents contractuels, planning de démarrage, désignation des interlocuteurs.', false, 1],
      ['Réception DN — Outbound matériel', 'Réception de la Delivery Note (DN) qui autorise la sortie du matériel du magasin client. Vérification des quantités et références sur le bon de livraison.', false, 2],
      ['MOS — Matériel On Site', 'Transport et livraison du matériel sur le site. Déchargement, comptage physique et constat de l\'état du matériel à l\'arrivée sur site.', false, 3],
      ['Réception LLD', 'Réception de la Low Level Design (LLD) : fiche technique indiquant les emplacements exacts des équipements, le passage des câbles power, fibre et RJ45 pour toutes les interconnexions.', false, 4],
      ['Vérification matériel par l\'équipe', 'L\'équipe terrain contrôle et inventorie tout le matériel reçu. Vérification des références, des quantités, de l\'état et de la conformité avec la LLD.', false, 5],
      ['Examination du scope sur site', 'Visite technique du site par l\'équipe. Compréhension du plan d\'implantation, identification des contraintes physiques, planification des accès et des zones de travail.', false, 6],
      ['Dispatch des tâches entre l\'équipe', 'Répartition des responsabilités : recensement des sources d\'énergie (baies, voltage), installation hardware (racks, serveurs, switchs), préparation câblage fibre (labellisation provisoire) et RJ45 (sertissage). Travail en étroite collaboration avec le client qui peut apporter des modifications en cours d\'exécution.', false, 7],
      ['Tests & vérification par le client', 'Le client inspecte et teste toutes les connexions réalisées par les équipes CleanIT. Vérification de la conformité avec la LLD et validation des points d\'interconnexion.', false, 8],
      ['Power On — Mise en énergie', 'Mise sous tension progressive des équipements après validation par le client. Vérification des indicateurs (LEDs, logs) et confirmation du bon fonctionnement électrique.', false, 9],
      ['Période d\'observation', 'Phase de surveillance post Power On. Monitoring de la stabilité des équipements sur plusieurs jours, détection et correction d\'éventuelles anomalies.', false, 10],
      ['Configuration par le client', 'Le client procède à la configuration logicielle et réseau des équipements. Cette phase ne concerne pas CleanIT — nous restons disponibles pour support physique si nécessaire.', true, 11],
      ['Labelling final + retour matériel', 'Étiquetage définitif de tous les câbles et équipements selon les normes du client. Retour du matériel restant (emballages, surplus) au magasin du client. Clôture du dossier.', false, 12],
    ];
    for (const [title, desc, client, idx] of ipPhases) {
      await pool.query('INSERT INTO project_type_phases (project_type_id,title,description,is_client_scope,order_index) VALUES ($1,$2,$3,$4,$5)', [ipId, title, desc, client, idx]);
    }
    } // fin IP Core

    // ── RURAL START (12 phases) ────────────────────────────────────
    const ruralExists = await pool.query("SELECT id FROM project_type_catalogue WHERE code='rural_start'");
    let ruralNeedsReset = false;
    if (ruralExists.rows[0]) {
      const rCount = await pool.query('SELECT COUNT(*) FROM project_type_phases WHERE project_type_id=$1', [ruralExists.rows[0].id]);
      if (parseInt(rCount.rows[0].count) < 12) {
        await pool.query('DELETE FROM project_type_phases WHERE project_type_id=$1', [ruralExists.rows[0].id]);
        await pool.query("DELETE FROM project_type_catalogue WHERE code='rural_start'");
        ruralNeedsReset = true;
        console.log('Rural Start reset: phases incomplètes supprimées, ré-insertion des 12 phases...');
      }
    }
    if (!ruralExists.rows[0] || ruralNeedsReset) {
    const rural = await pool.query(`INSERT INTO project_type_catalogue (code,name,category,description,context,color) VALUES ('rural_start','Rural Start','Radio / Microwave / Énergie Solaire',
      'Déploiement en zone rurale : construction de pylônes, installation d''antennes microwave et wireless, alimentation par panneaux solaires et batteries.',
      'Le Rural Start couvre le déploiement d''infrastructures télécoms en zone rurale ou hors réseau électrique. Il combine : construction mécanique (pylône), radiofréquences (antennes microwave, alignement), et énergie autonome (batteries, panneaux solaires). Chaque site implique un sous-traitant (SBC) sélectionné par appel d''offre.',
      '#7C3AED') RETURNING id`);
    const rId = rural.rows[0].id;
    const ruralPhases = [
      ['Appel d\'offre SBC', 'Lancement de l\'appel d\'offre auprès des sous-traitants (SBC — Sous-traitants en Bâtiment Civil). Sélection sur critères techniques et tarifaires pour chaque site.', false, 0],
      ['Mail de confirmation des sites', 'Confirmation officielle des sites retenus et des SBC attributaires. Transmission des coordonnées GPS, des contacts client et du planning prévisionnel.', false, 1],
      ['DCP Tests — Survey des sites', 'Reconnaissance terrain (survey) des sites. DCP tests (Displacement Capacity Probe) pour analyse du sol. Rapport technique sur la faisabilité mécanique et les contraintes d\'accès.', false, 2],
      ['Réception DN — Outbound matériel', 'Réception de la Delivery Note autorisant la sortie du matériel. Contrôle des équipements radio, antennes, câbles, batteries et matériaux de construction.', false, 3],
      ['Réception LLD + DCP Test', 'Réception de la Low Level Design validée intégrant les résultats des DCP tests. Document de référence pour l\'implantation exacte du pylône, des antennes et des équipements énergie.', false, 4],
      ['Fouilles et délimitation du périmètre', 'Implantation et marquage du périmètre de travail. Creusement des fondations selon les spécifications de la LLD et les résultats DCP. Mise en place du coffrage béton.', false, 5],
      ['Construction du pylône (tower)', 'Assemblage et levage des sections du pylône. Pose des haubans ou fixation selon le type de tower (autoportant, haubanné, monopole). Vérification de la verticalité et de la solidité.', false, 6],
      ['Installation antennes + alignement far-end', 'Montage des antennes microwave et wireless sur le pylône. Alignement précis vers le site far-end (site le plus proche recevant le signal). Confirmation du paramètre XPD (Cross Polar Discrimination) avec le site distant.', false, 7],
      ['Installation supports panneaux solaires', 'Pose et fixation des structures métalliques de support pour les panneaux solaires. Orientation optimale selon l\'ensoleillement local et l\'azimut calculé.', false, 8],
      ['Installation des batteries', 'Mise en place des batteries (banks) dans l\'abri technique. Connexion des câbles de charge et de distribution selon le schéma électrique. Vérification des polarités et des protections.', false, 9],
      ['Installation des panneaux solaires', 'Pose et fixation des panneaux photovoltaïques sur les supports. Câblage série/parallèle selon la tension et la capacité requises. Connexion au régulateur de charge.', false, 10],
      ['Connexion et mise en service', 'Connexion finale de tous les systèmes : panneaux → régulateur → batteries → équipements radio. Tests de charge, vérification du bon fonctionnement de l\'ensemble. Remise du site au client avec documentation complète.', false, 11],
    ];
    for (const [title, desc, client, idx] of ruralPhases) {
      await pool.query('INSERT INTO project_type_phases (project_type_id,title,description,is_client_scope,order_index) VALUES ($1,$2,$3,$4,$5)', [rId, title, desc, client, idx]);
    }
    } // fin Rural Start
  } catch(e) { console.error('Catalogue init error:', e.message); }
})();

// Routes catalogue
app.get('/project-catalogue', auth, async (req, res) => {
  try {
    const types = await pool.query('SELECT *, (SELECT COUNT(*) FROM project_type_phases WHERE project_type_id=pt.id)::int as phases_count FROM project_type_catalogue pt ORDER BY id ASC');
    res.json(types.rows);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.get('/project-catalogue/:id', auth, async (req, res) => {
  try {
    const [pt, phases] = await Promise.all([
      pool.query('SELECT * FROM project_type_catalogue WHERE id=$1', [req.params.id]),
      pool.query(`SELECT ph.*, COALESCE(json_agg(json_build_object('id',pp.id,'url',pp.url,'caption',pp.caption,'uploaded_at',pp.uploaded_at) ORDER BY pp.uploaded_at) FILTER (WHERE pp.id IS NOT NULL), '[]') as photos
        FROM project_type_phases ph LEFT JOIN project_phase_photos pp ON pp.phase_id=ph.id
        WHERE ph.project_type_id=$1 GROUP BY ph.id ORDER BY ph.order_index ASC`, [req.params.id]),
    ]);
    if (!pt.rows[0]) return res.status(404).json({message:'Type introuvable'});
    res.json({ ...pt.rows[0], phases: phases.rows });
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/project-catalogue', auth, isAdmin, async (req, res) => {
  try {
    const {code, name, category, description, context, color, icon} = req.body;
    if (!name || !code) return res.status(400).json({message:'Code et nom requis'});
    const r = await pool.query('INSERT INTO project_type_catalogue (code,name,category,description,context,color,icon) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [code, name, category||'', description||'', context||'', color||'#1B4F8A', icon||'network']);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/project-catalogue/:id', auth, isAdmin, async (req, res) => {
  try {
    const {name, category, description, context, color} = req.body;
    const r = await pool.query('UPDATE project_type_catalogue SET name=COALESCE($1,name),category=COALESCE($2,category),description=COALESCE($3,description),context=COALESCE($4,context),color=COALESCE($5,color),updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, category, description, context, color, req.params.id]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/project-catalogue/:id/phases', auth, async (req, res) => {
  try {
    const {title, description, is_client_scope, order_index} = req.body;
    if (!title) return res.status(400).json({message:'Titre requis'});
    const r = await pool.query('INSERT INTO project_type_phases (project_type_id,title,description,is_client_scope,order_index) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, title, description||'', is_client_scope||false, order_index||0]);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.put('/project-phases/:phaseId', auth, async (req, res) => {
  try {
    const {title, description, is_client_scope} = req.body;
    const r = await pool.query('UPDATE project_type_phases SET title=COALESCE($1,title),description=COALESCE($2,description),is_client_scope=COALESCE($3,is_client_scope) WHERE id=$4 RETURNING *',
      [title, description, is_client_scope, req.params.phaseId]);
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.delete('/project-phases/:phaseId', auth, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_type_phases WHERE id=$1', [req.params.phaseId]);
    res.json({ok:true});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

app.post('/project-phases/:phaseId/photos', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({message:'Aucun fichier'});
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({message:'Blob non configuré'});
    const { put } = require('@vercel/blob');
    const blob = await put(`project-phases/${req.params.phaseId}-${Date.now()}.jpg`, req.file.buffer, { access:'public', contentType:req.file.mimetype||'image/jpeg', addRandomSuffix:false });
    const r = await pool.query('INSERT INTO project_phase_photos (phase_id,url,caption,uploaded_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.phaseId, blob.url, req.body.caption||'', req.user.sub]);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur photo',error:e.message}); }
});

app.delete('/project-phase-photos/:photoId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_phase_photos WHERE id=$1', [req.params.photoId]);
    res.json({ok:true});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// ── EXÉCUTION PAR SITE ────────────────────────────────────────────────
// Un "site en cours" = une instance réelle d'un type de projet sur un site précis.
// À la création, toutes les phases du template sont copiées automatiquement pour ce site.

pool.query(`CREATE TABLE IF NOT EXISTS project_site_executions (
  id SERIAL PRIMARY KEY,
  project_type_id INTEGER REFERENCES project_type_catalogue(id) ON DELETE CASCADE,
  site_code VARCHAR(50) NOT NULL,
  site_name VARCHAR(200),
  region VARCHAR(100),
  client VARCHAR(200),
  bc_reference VARCHAR(200),
  chef_projet_id INTEGER REFERENCES users(id),
  status VARCHAR(30) DEFAULT 'en_cours',
  start_date DATE,
  target_date DATE,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS project_execution_phases (
  id SERIAL PRIMARY KEY,
  execution_id INTEGER REFERENCES project_site_executions(id) ON DELETE CASCADE,
  template_phase_id INTEGER REFERENCES project_type_phases(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_client_scope BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
)`).catch(console.error);

pool.query(`CREATE TABLE IF NOT EXISTS project_execution_photos (
  id SERIAL PRIMARY KEY,
  execution_phase_id INTEGER REFERENCES project_execution_phases(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// Liste des sites en cours pour un type de projet
app.get('/project-catalogue/:id/sites', auth, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT pse.*,
        u."firstName"||' '||u."lastName" as chef_nom,
        COUNT(DISTINCT pep.id)::int as total_phases,
        COUNT(DISTINCT CASE WHEN pep.status='done' THEN pep.id END)::int as done_phases
      FROM project_site_executions pse
      LEFT JOIN users u ON u.id = pse.chef_projet_id
      LEFT JOIN project_execution_phases pep ON pep.execution_id = pse.id
      WHERE pse.project_type_id = $1
      GROUP BY pse.id, u."firstName", u."lastName"
      ORDER BY pse.created_at DESC
    `, [req.params.id]);
    res.json(r.rows);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Rattacher un site à un type de projet (copie automatique des phases du template)
app.post('/project-catalogue/:id/sites', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {site_code, site_name, region, client: clientName, bc_reference, chef_projet_id, status, start_date, target_date, notes} = req.body;
    if (!site_code) return res.status(400).json({message:'Code site requis'});

    // Créer l'exécution
    const exec = await client.query(
      `INSERT INTO project_site_executions (project_type_id,site_code,site_name,region,client,bc_reference,chef_projet_id,status,start_date,target_date,notes,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.params.id, site_code, site_name||'', region||'', clientName||'', bc_reference||'', chef_projet_id||null, status||'en_cours', start_date||null, target_date||null, notes||'', req.user.sub]
    );
    const execId = exec.rows[0].id;

    // Copier toutes les phases du template
    const phases = await client.query('SELECT * FROM project_type_phases WHERE project_type_id=$1 ORDER BY order_index ASC', [req.params.id]);
    for (const ph of phases.rows) {
      await client.query(
        `INSERT INTO project_execution_phases (execution_id,template_phase_id,title,description,is_client_scope,order_index,status)
         VALUES ($1,$2,$3,$4,$5,$6,'pending')`,
        [execId, ph.id, ph.title, ph.description, ph.is_client_scope, ph.order_index]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(exec.rows[0]);
  } catch(e) {
    await client.query('ROLLBACK');
    res.status(500).json({message:'Erreur',error:e.message});
  } finally { client.release(); }
});

// Détail d'une exécution (site + ses phases + photos)
app.get('/project-site-executions/:id', auth, async (req, res) => {
  try {
    const [exec, phases] = await Promise.all([
      pool.query(`SELECT pse.*, u."firstName"||' '||u."lastName" as chef_nom,
        pt.name as type_name, pt.color as type_color
        FROM project_site_executions pse
        LEFT JOIN users u ON u.id=pse.chef_projet_id
        LEFT JOIN project_type_catalogue pt ON pt.id=pse.project_type_id
        WHERE pse.id=$1`, [req.params.id]),
      pool.query(`
        SELECT pep.*,
          COALESCE(json_agg(json_build_object('id',pp.id,'url',pp.url,'caption',pp.caption,'uploaded_at',pp.uploaded_at) ORDER BY pp.uploaded_at) FILTER (WHERE pp.id IS NOT NULL),'[]') as photos
        FROM project_execution_phases pep
        LEFT JOIN project_execution_photos pp ON pp.execution_phase_id=pep.id
        WHERE pep.execution_id=$1
        GROUP BY pep.id ORDER BY pep.order_index ASC
      `, [req.params.id]),
    ]);
    if (!exec.rows[0]) return res.status(404).json({message:'Exécution introuvable'});
    res.json({...exec.rows[0], phases: phases.rows});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Mettre à jour le statut/notes d'une phase d'exécution
app.put('/project-execution-phases/:id', auth, async (req, res) => {
  try {
    const {status, notes} = req.body;
    const startedAt = status==='in_progress' ? new Date().toISOString() : null;
    const completedAt = status==='done' ? new Date().toISOString() : null;
    const r = await pool.query(
      `UPDATE project_execution_phases SET
        status=COALESCE($1,status), notes=COALESCE($2,notes),
        started_at=COALESCE($3,started_at), completed_at=COALESCE($4,completed_at)
       WHERE id=$5 RETURNING *`,
      [status, notes, startedAt, completedAt, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Mettre à jour le statut global d'une exécution (site)
app.put('/project-site-executions/:id', auth, async (req, res) => {
  try {
    const {status, notes, target_date} = req.body;
    const r = await pool.query(
      `UPDATE project_site_executions SET status=COALESCE($1,status),notes=COALESCE($2,notes),target_date=COALESCE($3,target_date),updated_at=NOW() WHERE id=$4 RETURNING *`,
      [status, notes, target_date, req.params.id]
    );
    res.json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// Upload photo sur une phase d'exécution
app.post('/project-execution-phases/:id/photos', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({message:'Aucun fichier'});
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(500).json({message:'Blob non configuré'});
    const {put} = require('@vercel/blob');
    const blob = await put(`exec-phases/${req.params.id}-${Date.now()}.jpg`, req.file.buffer, {access:'public',contentType:req.file.mimetype||'image/jpeg',addRandomSuffix:false});
    const r = await pool.query('INSERT INTO project_execution_photos (execution_phase_id,url,caption,uploaded_by) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, blob.url, req.body.caption||'', req.user.sub]);
    res.status(201).json(r.rows[0]);
  } catch(e) { res.status(500).json({message:'Erreur photo',error:e.message}); }
});

app.delete('/project-execution-photos/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_execution_photos WHERE id=$1',[req.params.id]);
    res.json({ok:true});
  } catch(e) { res.status(500).json({message:'Erreur',error:e.message}); }
});

// ── CLEANITBOOKS — ROUTES MANQUANTES ────────────────────────────
// Ces tables existent en base (cib_invoices, cib_customers, cib_jobs, cib_bills, cib_vendors)
// mais n'avaient aucune route API exposée — d'où les 404 dans la console.

// CUSTOMERS
app.get('/api/cleanitbooks/customers', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_customers ORDER BY id DESC'); res.json(r.rows); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/customers', auth, async (req,res)=>{
  try {
    const {name,email,phone,address,country,taxId} = req.body;
    const r=await pool.query('INSERT INTO cib_customers (name,email,phone,address,country,"taxId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[name,email||null,phone||null,address||null,country||'CM',taxId||null]);
    res.status(201).json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.put('/api/cleanitbooks/customers/:id', auth, async (req,res)=>{
  try {
    const {name,email,phone,address,country,taxId} = req.body;
    const r=await pool.query('UPDATE cib_customers SET name=$1,email=$2,phone=$3,address=$4,country=$5,"taxId"=$6 WHERE id=$7 RETURNING *',[name,email||null,phone||null,address||null,country||'CM',taxId||null,req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.delete('/api/cleanitbooks/customers/:id', auth, async (req,res)=>{
  try { await pool.query('DELETE FROM cib_customers WHERE id=$1',[req.params.id]); res.json({ok:true}); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// VENDORS
app.get('/api/cleanitbooks/vendors', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_vendors ORDER BY id DESC'); res.json(r.rows); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/vendors', auth, async (req,res)=>{
  try {
    const {name,email,phone,address,country,taxId} = req.body;
    const r=await pool.query('INSERT INTO cib_vendors (name,email,phone,address,country,"taxId") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[name,email||null,phone||null,address||null,country||'CM',taxId||null]);
    res.status(201).json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.put('/api/cleanitbooks/vendors/:id', auth, async (req,res)=>{
  try {
    const {name,email,phone,address,country,taxId} = req.body;
    const r=await pool.query('UPDATE cib_vendors SET name=$1,email=$2,phone=$3,address=$4,country=$5,"taxId"=$6 WHERE id=$7 RETURNING *',[name,email||null,phone||null,address||null,country||'CM',taxId||null,req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// INVOICES
app.get('/api/cleanitbooks/invoices', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_invoices ORDER BY id DESC'); res.json(r.rows); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.get('/api/cleanitbooks/invoices/:id', auth, async (req,res)=>{
  try {
    const inv=await pool.query('SELECT * FROM cib_invoices WHERE id=$1',[req.params.id]);
    if(!inv.rows[0]) return res.status(404).json({message:'Facture introuvable'});
    const lines=await pool.query('SELECT * FROM cib_invoice_lines WHERE "invoiceId"=$1',[req.params.id]);
    res.json({...inv.rows[0], lines: lines.rows});
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/invoices', auth, async (req,res)=>{
  try {
    const {customerId,number,date,dueDate,currency,status,lines,notes} = req.body;
    const total=(lines||[]).reduce((s,l)=>s+(parseFloat(l.qty||0)*parseFloat(l.unitPrice||0)),0);
    const r=await pool.query('INSERT INTO cib_invoices ("customerId",number,date,"dueDate",currency,status,total,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[customerId,number,date,dueDate,currency||'FCFA',status||'draft',total,notes||null]);
    const inv=r.rows[0];
    for(const l of (lines||[])){
      await pool.query('INSERT INTO cib_invoice_lines ("invoiceId",description,qty,"unitPrice","taxRate") VALUES ($1,$2,$3,$4,$5)',[inv.id,l.description,l.qty||1,l.unitPrice||0,l.taxRate||0]);
    }
    res.status(201).json(inv);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.put('/api/cleanitbooks/invoices/:id', auth, async (req,res)=>{
  try {
    const {status,notes,dueDate} = req.body;
    const r=await pool.query('UPDATE cib_invoices SET status=COALESCE($1,status),notes=COALESCE($2,notes),"dueDate"=COALESCE($3,"dueDate") WHERE id=$4 RETURNING *',[status,notes,dueDate,req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// BILLS (fournisseurs)
app.get('/api/cleanitbooks/bills', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_bills ORDER BY id DESC'); res.json(r.rows); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/bills', auth, async (req,res)=>{
  try {
    const {vendorId,number,date,dueDate,currency,status,total,notes} = req.body;
    const r=await pool.query('INSERT INTO cib_bills ("vendorId",number,date,"dueDate",currency,status,total,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[vendorId,number,date,dueDate,currency||'FCFA',status||'draft',total||0,notes||null]);
    res.status(201).json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.put('/api/cleanitbooks/bills/:id', auth, async (req,res)=>{
  try {
    const {status,notes} = req.body;
    const r=await pool.query('UPDATE cib_bills SET status=COALESCE($1,status),notes=COALESCE($2,notes) WHERE id=$3 RETURNING *',[status,notes,req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// JOBS (projets / chantiers CIB)
app.get('/api/cleanitbooks/jobs', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_jobs ORDER BY id DESC'); res.json(r.rows); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.get('/api/cleanitbooks/jobs/:id', auth, async (req,res)=>{
  try { const r=await pool.query('SELECT * FROM cib_jobs WHERE id=$1',[req.params.id]); res.json(r.rows[0]||null); }
  catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/jobs', auth, async (req,res)=>{
  try {
    const {name,customerId,budget,currency,status,startDate,endDate,description} = req.body;
    const r=await pool.query('INSERT INTO cib_jobs (name,"customerId",budget,currency,status,"startDate","endDate",description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[name,customerId,budget||0,currency||'FCFA',status||'active',startDate||null,endDate||null,description||null]);
    res.status(201).json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.put('/api/cleanitbooks/jobs/:id', auth, async (req,res)=>{
  try {
    const {name,status,budget,endDate,description} = req.body;
    const r=await pool.query('UPDATE cib_jobs SET name=COALESCE($1,name),status=COALESCE($2,status),budget=COALESCE($3,budget),"endDate"=COALESCE($4,"endDate"),description=COALESCE($5,description) WHERE id=$6 RETURNING *',[name,status,budget,endDate,description,req.params.id]);
    res.json(r.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// P&L et BALANCE (calculs depuis les vraies données)
app.get('/api/cleanitbooks/pl', auth, async (req,res)=>{
  try {
    const [inv, bil] = await Promise.all([
      pool.query('SELECT COALESCE(SUM(total),0) as total FROM cib_invoices WHERE status IN (\'paid\',\'partial\')'),
      pool.query('SELECT COALESCE(SUM(total),0) as total FROM cib_bills WHERE status IN (\'paid\',\'partial\')'),
    ]);
    const revenue = parseFloat(inv.rows[0].total)||0;
    const expenses = parseFloat(bil.rows[0].total)||0;
    res.json({ revenue, expenses, profit: revenue-expenses });
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.get('/api/cleanitbooks/balance', auth, async (req,res)=>{
  try {
    const r=await pool.query('SELECT * FROM cib_accounts ORDER BY "accountCode" ASC');
    res.json(r.rows);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});

// ── JOURNAL CIB ──
app.get('/api/cleanitbooks/journal', auth, async (req,res)=>{
  try {
    const r=await pool.query(`SELECT je.*,
      COALESCE(json_agg(json_build_object('account',jl."accountCode",'accountNom',jl."accountNom",'debit',jl.debit,'credit',jl.credit,'libelle',jl.libelle)) FILTER (WHERE jl.id IS NOT NULL), '[]') as lines
      FROM cib_journal_entries je
      LEFT JOIN cib_journal_lines jl ON jl."entryId"=je.id
      GROUP BY je.id ORDER BY je.date DESC LIMIT 200`);
    res.json(r.rows);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.post('/api/cleanitbooks/journal', auth, async (req,res)=>{
  try {
    const {date,libelle,journal,lines=[]}=req.body;
    const je=await pool.query(`INSERT INTO cib_journal_entries(date,libelle,journal,"createdAt") VALUES($1,$2,$3,NOW()) RETURNING *`,[date,libelle,journal]);
    const jeId=je.rows[0].id;
    for(const l of lines){
      await pool.query(`INSERT INTO cib_journal_lines("entryId","accountCode","accountNom",debit,credit,libelle) VALUES($1,$2,$3,$4,$5,$6)`,
        [jeId,l.account,l.accountNom||'',l.debit||0,l.credit||0,l.libelle||l.memo||'']);
    }
    res.json(je.rows[0]);
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});
app.get('/api/cleanitbooks/dashboard', auth, async (req,res)=>{
  try {
    const [inv,bills,jobs,cust]=await Promise.all([
      pool.query('SELECT COUNT(*) as count,COALESCE(SUM(total),0) as total FROM cib_invoices'),
      pool.query('SELECT COUNT(*) as count,COALESCE(SUM(total),0) as total FROM cib_bills'),
      pool.query('SELECT COUNT(*) as count FROM cib_jobs'),
      pool.query('SELECT COUNT(*) as count FROM cib_customers'),
    ]);
    res.json({
      invoices:{count:parseInt(inv.rows[0].count),total:parseFloat(inv.rows[0].total)},
      bills:{count:parseInt(bills.rows[0].count),total:parseFloat(bills.rows[0].total)},
      jobs:parseInt(jobs.rows[0].count),
      customers:parseInt(cust.rows[0].count),
    });
  } catch(e){ res.status(500).json({message:'Erreur',error:e.message}); }
});


// ════════════════════════════════════════════════════════════
// PLANNING — événements, jalons, disponibilité techniciens
// ════════════════════════════════════════════════════════════
pool.query(`CREATE TABLE IF NOT EXISTS planning_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) DEFAULT 'reunion_interne',
  dept VARCHAR(50) DEFAULT 'terrain',
  visibility VARCHAR(20) DEFAULT 'entreprise',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_hour INTEGER DEFAULT 8,
  end_hour INTEGER DEFAULT 10,
  all_day BOOLEAN DEFAULT false,
  description TEXT,
  location VARCHAR(200),
  mission_id INTEGER,
  tech_ids JSONB DEFAULT '[]',
  created_by INTEGER REFERENCES users(id),
  created_by_name VARCHAR(100),
  zoom_link VARCHAR(300),
  comm_channel VARCHAR(100),
  link_module VARCHAR(50),
  link_detail VARCHAR(200),
  status VARCHAR(20) DEFAULT 'confirmed',
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

app.get('/planning/events', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    let q = `SELECT e.*, u."firstName"||' '||u."lastName" as creator_name
      FROM planning_events e LEFT JOIN users u ON e.created_by = u.id
      WHERE (e.visibility='entreprise' OR e.visibility='equipe' OR e.created_by=$1)`;
    const params = [req.user.sub];
    if(start) { q += ` AND e.end_date >= $${params.length+1}`; params.push(start); }
    if(end)   { q += ` AND e.start_date <= $${params.length+1}`; params.push(end); }
    q += ` ORDER BY e.start_date ASC, e.start_hour ASC`;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/planning/events', auth, async (req, res) => {
  try {
    const { title, type, dept, visibility, startDate, endDate, startHour, endHour,
            allDay, description, location, missionId, techIds, zoomLink,
            commChannel, linkModule, linkDetail, color } = req.body;
    if(!title || !startDate) return res.status(400).json({ message: 'Titre et date requis' });
    const u = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1', [req.user.sub]);
    const name = u.rows[0] ? u.rows[0].firstName+' '+u.rows[0].lastName : 'Utilisateur';
    const result = await pool.query(`
      INSERT INTO planning_events
        (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
         description,location,mission_id,tech_ids,created_by,created_by_name,
         zoom_link,comm_channel,link_module,link_detail,color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
      RETURNING *`,
      [title, type||'reunion_interne', dept||'terrain', visibility||'entreprise',
       startDate, endDate||startDate, startHour||8, endHour||10, allDay||false,
       description||null, location||null, missionId||null,
       JSON.stringify(techIds||[]), req.user.sub, name,
       zoomLink||null, commChannel||null, linkModule||null, linkDetail||null, color||null]);
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.put('/planning/events/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, dept, visibility, startDate, endDate, startHour, endHour,
            allDay, description, location, techIds, status, zoomLink, color } = req.body;
    const result = await pool.query(`
      UPDATE planning_events SET
        title=COALESCE($1,title), type=COALESCE($2,type), dept=COALESCE($3,dept),
        visibility=COALESCE($4,visibility), start_date=COALESCE($5,start_date),
        end_date=COALESCE($6,end_date), start_hour=COALESCE($7,start_hour),
        end_hour=COALESCE($8,end_hour), all_day=COALESCE($9,all_day),
        description=COALESCE($10,description), location=COALESCE($11,location),
        tech_ids=COALESCE($12,tech_ids), status=COALESCE($13,status),
        zoom_link=COALESCE($14,zoom_link), color=COALESCE($15,color),
        updated_at=NOW()
      WHERE id=$16 RETURNING *`,
      [title, type, dept, visibility, startDate, endDate, startHour, endHour,
       allDay, description, location, techIds?JSON.stringify(techIds):null,
       status, zoomLink, color, id]);
    res.json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.delete('/planning/events/:id', auth, async (req, res) => {
  try {
    const roleQ = await pool.query('SELECT role FROM users WHERE id=$1',[req.user.sub]);
    const isAdminUser = roleQ.rows[0]?.role==='admin';
    await pool.query('DELETE FROM planning_events WHERE id=$1 AND (created_by=$2 OR $3=true)',
      [req.params.id, req.user.sub, isAdminUser]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.get('/planning/availability/:techId', auth, async (req, res) => {
  try {
    const { techId } = req.params;
    const { startDate, endDate } = req.query;
    const conflicts = await pool.query(`
      SELECT id, title, start_date, end_date, start_hour, end_hour, type
      FROM planning_events
      WHERE tech_ids @> $1::jsonb AND status != 'cancelled'
        AND start_date <= $3 AND end_date >= $2`,
      [JSON.stringify([String(techId)]), startDate, endDate]);
    res.json({ available: conflicts.rows.length === 0, conflicts: conflicts.rows });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

// ════════════════════════════════════════════════════════════
// BC SITES — lignes détaillées Bon de Commande type planning (Type A)
// ════════════════════════════════════════════════════════════
pool.query(`CREATE TABLE IF NOT EXISTS bc_sites (
  id SERIAL PRIMARY KEY,
  bc_id INTEGER REFERENCES bons_commande(id) ON DELETE CASCADE,
  project_type VARCHAR(50),
  site_id VARCHAR(50) NOT NULL,
  site_name VARCHAR(150),
  team_leader VARCHAR(100),
  team_leader_id INTEGER REFERENCES users(id),
  budget_transport NUMERIC(15,2) DEFAULT 0,
  budget_materiel NUMERIC(15,2) DEFAULT 0,
  budget_total NUMERIC(15,2) DEFAULT 0,
  payment_1 NUMERIC(15,2) DEFAULT 0,
  payment_2 NUMERIC(15,2) DEFAULT 0,
  payment_3 NUMERIC(15,2) DEFAULT 0,
  balance NUMERIC(15,2) DEFAULT 0,
  request_amount NUMERIC(15,2) DEFAULT 0,
  approval_status VARCHAR(30) DEFAULT 'pending',
  approval_id INTEGER REFERENCES approvals(id) ON DELETE SET NULL,
  outbound_date DATE,
  mos_date DATE,
  install_start_date DATE,
  install_closed_date DATE,
  qc_ran_date DATE,
  qc_mw_date DATE,
  remark TEXT,
  planning_event_id INTEGER REFERENCES planning_events(id) ON DELETE SET NULL,
  raw_columns JSONB DEFAULT '{}',
  source_type VARCHAR(10) DEFAULT 'A',
  needs_review BOOLEAN DEFAULT false,
  review_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// ════════════════════════════════════════════════════════════
// BC LINES — lignes classiques Type B (désignation/qté/prix)
// ════════════════════════════════════════════════════════════
pool.query(`CREATE TABLE IF NOT EXISTS bc_lines (
  id SERIAL PRIMARY KEY,
  bc_id INTEGER REFERENCES bons_commande(id) ON DELETE CASCADE,
  reference VARCHAR(100),
  designation VARCHAR(300) NOT NULL,
  unite VARCHAR(30),
  quantite NUMERIC(15,3) DEFAULT 0,
  prix_unitaire NUMERIC(15,2) DEFAULT 0,
  remise_pct NUMERIC(5,2) DEFAULT 0,
  total_ht NUMERIC(15,2) DEFAULT 0,
  tva_pct NUMERIC(5,2) DEFAULT 19.25,
  total_ttc NUMERIC(15,2) DEFAULT 0,
  is_forfait BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,
  review_note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

app.get('/bc-sites', auth, async (req,res)=>{
  try{
    const {bcId} = req.query;
    const q = bcId
      ? 'SELECT * FROM bc_sites WHERE bc_id=$1 ORDER BY project_type, site_id'
      : 'SELECT * FROM bc_sites ORDER BY created_at DESC LIMIT 300';
    const r = await pool.query(q, bcId?[bcId]:[]);
    res.json(r.rows);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.get('/bc-lines', auth, async (req,res)=>{
  try{
    const {bcId} = req.query;
    const q = bcId
      ? 'SELECT * FROM bc_lines WHERE bc_id=$1 ORDER BY id'
      : 'SELECT * FROM bc_lines ORDER BY created_at DESC LIMIT 300';
    const r = await pool.query(q, bcId?[bcId]:[]);
    res.json(r.rows);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.post('/bc-sites/bulk', auth, async (req,res)=>{
  try{
    const { bcId, sites } = req.body;
    if(!bcId || !Array.isArray(sites) || !sites.length)
      return res.status(400).json({message:'bcId et sites[] requis'});
    const inserted = [];
    for(const s of sites){
      const r = await pool.query(`
        INSERT INTO bc_sites
          (bc_id,project_type,site_id,site_name,team_leader,team_leader_id,
           budget_transport,budget_materiel,budget_total,payment_1,payment_2,payment_3,
           balance,request_amount,outbound_date,mos_date,install_start_date,
           install_closed_date,qc_ran_date,qc_mw_date,remark,raw_columns,source_type,
           needs_review,review_note)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
        RETURNING *`,
        [bcId, s.projectType||null, s.siteId, s.siteName||null, s.teamLeader||null, s.teamLeaderId||null,
         s.budgetTransport||0, s.budgetMateriel||0, s.budgetTotal||0,
         s.payment1||0, s.payment2||0, s.payment3||0,
         s.balance||0, s.requestAmount||s.budgetTotal||0,
         s.outboundDate||null, s.mosDate||null, s.installStartDate||null,
         s.installClosedDate||null, s.qcRanDate||null, s.qcMwDate||null, s.remark||null,
         JSON.stringify(s.rawColumns||{}), s.sourceType||'A',
         s.needsReview||false, s.reviewNote||null]
      );
      inserted.push(r.rows[0]);
    }
    res.status(201).json({inserted, count:inserted.length});
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.post('/bc-lines/bulk', auth, async (req,res)=>{
  try{
    const { bcId, lines } = req.body;
    if(!bcId || !Array.isArray(lines) || !lines.length)
      return res.status(400).json({message:'bcId et lines[] requis'});
    const inserted = [];
    for(const l of lines){
      const r = await pool.query(`
        INSERT INTO bc_lines
          (bc_id,reference,designation,unite,quantite,prix_unitaire,remise_pct,
           total_ht,tva_pct,total_ttc,is_forfait,needs_review,review_note)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [bcId, l.reference||null, l.designation, l.unite||null,
         l.quantite||0, l.prixUnitaire||0, l.remisePct||0,
         l.totalHt||0, l.tvaPct||19.25, l.totalTtc||0,
         l.isForfait||false, l.needsReview||false, l.reviewNote||null]
      );
      inserted.push(r.rows[0]);
    }
    res.status(201).json({inserted, count:inserted.length});
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.put('/bc-sites/:id', auth, async (req,res)=>{
  try{
    const f = req.body;
    const map = {
      projectType:'project_type', siteId:'site_id', siteName:'site_name',
      teamLeader:'team_leader', teamLeaderId:'team_leader_id',
      budgetTransport:'budget_transport', budgetMateriel:'budget_materiel', budgetTotal:'budget_total',
      payment1:'payment_1', payment2:'payment_2', payment3:'payment_3',
      balance:'balance', requestAmount:'request_amount', approvalStatus:'approval_status',
      outboundDate:'outbound_date', mosDate:'mos_date', installStartDate:'install_start_date',
      installClosedDate:'install_closed_date', qcRanDate:'qc_ran_date', qcMwDate:'qc_mw_date',
      remark:'remark', needsReview:'needs_review', reviewNote:'review_note',
    };
    const sets=[]; const vals=[];
    for(const [k,col] of Object.entries(map)){
      if(f[k]!==undefined){ sets.push(`${col}=$${vals.length+1}`); vals.push(f[k]); }
    }
    if(!sets.length) return res.status(400).json({message:'Rien à mettre à jour'});
    sets.push('updated_at=NOW()');
    vals.push(req.params.id);
    const r = await pool.query(`UPDATE bc_sites SET ${sets.join(',')} WHERE id=$${vals.length} RETURNING *`, vals);
    res.json(r.rows[0]);
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.post('/bc-sites/:id/request-payment', auth, async (req,res)=>{
  try{
    const site = await pool.query('SELECT * FROM bc_sites WHERE id=$1',[req.params.id]);
    if(!site.rows[0]) return res.status(404).json({message:'Site introuvable'});
    const s = site.rows[0];
    const { amount, paymentLabel } = req.body;
    const amt = Number(amount)||Number(s.request_amount)||Number(s.budget_total)||0;
    const bc = await pool.query('SELECT * FROM bons_commande WHERE id=$1',[s.bc_id]);
    const uq = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const uname = uq.rows[0] ? `${uq.rows[0].firstName} ${uq.rows[0].lastName}` : 'Utilisateur';
    const r = await pool.query(`
      INSERT INTO approvals (type,label,detail,amount,site_code,beneficiary_name,user_id,user_name,status)
      VALUES ('payment_request',$1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`,
      [paymentLabel||`Paiement ${s.site_id} — ${s.site_name||''}`,
       `Team Leader: ${s.team_leader||'—'} · Projet: ${bc.rows[0]?.client||''}`,
       amt, s.site_id, s.team_leader||'', req.user.sub, uname]
    );
    await pool.query('UPDATE bc_sites SET approval_id=$1, approval_status=$2 WHERE id=$3',
      [r.rows[0].id, 'submitted', s.id]);
    res.status(201).json({approval:r.rows[0], message:'Demande de paiement créée'});
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

app.post('/bc-sites/:id/create-jalon', auth, async (req,res)=>{
  try{
    const site = await pool.query('SELECT * FROM bc_sites WHERE id=$1',[req.params.id]);
    if(!site.rows[0]) return res.status(404).json({message:'Site introuvable'});
    const s = site.rows[0];
    const u = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const name = u.rows[0] ? `${u.rows[0].firstName} ${u.rows[0].lastName}` : 'Utilisateur';
    const start = s.outbound_date || s.install_start_date || new Date().toISOString().split('T')[0];
    const end = s.install_closed_date || s.mos_date || start;
    const r = await pool.query(`
      INSERT INTO planning_events
        (title,type,dept,visibility,start_date,end_date,start_hour,end_hour,all_day,
         description,link_module,link_detail,color,created_by,created_by_name,status,tech_ids)
      VALUES ($1,'mission','terrain','entreprise',$2,$3,8,17,true,$4,'bons_commande',$5,'#0A2D6E',$6,$7,'confirmed',$8)
      RETURNING *`,
      [`${s.site_id} — ${s.site_name||''}`, start, end,
       `Team Leader: ${s.team_leader||'—'} · Budget: ${Number(s.budget_total||0).toLocaleString('fr-FR')} FCFA${s.remark?' · '+s.remark:''}`,
       `bc_site:${s.id}`, req.user.sub, name,
       JSON.stringify(s.team_leader_id?[String(s.team_leader_id)]:[])]
    );
    await pool.query('UPDATE bc_sites SET planning_event_id=$1 WHERE id=$2',[r.rows[0].id, s.id]);
    res.status(201).json({event:r.rows[0], message:'Jalon Planning créé'});
  }catch(e){res.status(500).json({message:'Erreur serveur',error:e.message});}
});

// POST /bons-commande/analyze — upload fichier brut (Excel/PDF), retourne texte/JSON brut pour ChaCha
app.post('/bons-commande/analyze', auth, upload.single('file'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({message:'Fichier requis'});
    const ext = (req.file.originalname||'').toLowerCase();

    if(ext.endsWith('.xlsx')||ext.endsWith('.xls')) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const sheets = [];
      wb.worksheets.forEach(ws => {
        const rows = [];
        ws.eachRow((row, rowNum) => {
          const vals = [];
          row.eachCell({includeEmpty:true}, (cell) => {
            let v = cell.value;
            if(v && typeof v === 'object' && v.result !== undefined) v = v.result; // formule résolue
            if(v instanceof Date) v = v.toISOString().split('T')[0];
            vals.push(v===null||v===undefined?null:v);
          });
          rows.push(vals);
        });
        sheets.push({ name: ws.name, rows });
      });
      return res.json({ type:'excel', sheets });
    }

    if(ext.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        return res.json({ type:'pdf', text: pdfData.text, pages: pdfData.numpages, filename: req.file.originalname });
      } catch(pdfErr) {
        // Si l'extraction échoue (PDF scanné/image), informer clairement plutôt que d'envoyer du texte vide
        return res.json({ type:'pdf', text: '', pages: 0, filename: req.file.originalname,
          warning: 'Ce PDF semble être un document scanné (image) sans texte extractible. L\'OCR n\'est pas encore disponible pour ce type de fichier.' });
      }
    }

    res.status(400).json({message:'Format non supporté. Utilisez .xlsx, .xls ou .pdf'});
  } catch(e) {
    res.status(500).json({message:'Erreur analyse fichier', error:e.message});
  }
});

// ─── MULTI-TENANT SaaS ─────────────────────────────────────────────────
const mt = require('./multitenant');
mt.initRoutes(pool, app, auth);      // synchrone — routes enregistrées avant le 404
mt.initDB(pool).catch(e => console.error('MT DB:', e.message)); // async DB

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

