const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 8000,
});

const JWT_SECRET = process.env.JWT_SECRET || 'cleanit_secret';

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    const result = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (e) {
    console.error('Login error:', e.message);
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
});

// POST /auth/register
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName) return res.status(400).json({ message: 'Champs requis manquants' });
    const exists = await pool.query('SELECT id FROM "users" WHERE email = $1', [email]);
    if (exists.rows[0]) return res.status(400).json({ message: 'Email deja utilise' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO "users" (email, password, "firstName", "lastName", role, "isActive") VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, "firstName", "lastName", role',
      [email, hash, firstName, lastName || '', role || 'bureau', false]
    );
    const user = result.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user, message: 'Compte cree. En attente de validation admin.' });
  } catch (e) {
    console.error('Register error:', e.message);
    res.status(500).json({ message: 'Erreur serveur', error: e.message });
  }
});

// GET /auth/me
app.get('/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Token requis' });
    const token = auth.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, email, "firstName", "lastName", role FROM "users" WHERE id = $1', [payload.sub]);
    res.json(result.rows[0]);
  } catch (e) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// GET /users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, "firstName", "lastName", role, "isActive" FROM "users" ORDER BY id');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', app: 'CleanIT ERP API', version: '2.0' }));

module.exports = app;
