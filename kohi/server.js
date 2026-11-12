const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const JWT_EXPIRES_IN = '1h';

const db = new Database(path.join(__dirname, 'kohi.db'));
db.pragma('journal_mode = WAL');

const insertUser = db.prepare(
  `INSERT INTO waitlist (name, email, password_hash, position)
   VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist))`
);
const getByEmail = db.prepare('SELECT * FROM waitlist WHERE email = ?');
const getById = db.prepare('SELECT id, name, email, position FROM waitlist WHERE id = ?');
const countAll = db.prepare('SELECT COUNT(*) AS total FROM waitlist');
const getPosition = db.prepare('SELECT position FROM waitlist WHERE id = ?');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (![name, email, password].every(isNonEmptyString)) {
    return res.status(400).json({ error: 'name, email y password son requeridos' });
  }
  const cleanEmail = email.trim().toLowerCase();

  if (getByEmail.get(cleanEmail)) {
    return res.status(409).json({ error: 'El email ya está registrado' });
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    // Un solo statement: posición calculada y guardada atómicamente.
    const { lastInsertRowid } = insertUser.run(name.trim(), cleanEmail, hash);
    const { position } = getPosition.get(lastInsertRowid);
    res.status(201).json({ success: true, message: 'Registro exitoso', position });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (![email, password].every(isNonEmptyString)) {
    return res.status(400).json({ error: 'email y password son requeridos' });
  }
  const user = getByEmail.get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token });
});

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

app.get('/api/me', auth, (req, res) => {
  const user = getById.get(req.userId);
  if (!user) return res.status(401).json({ error: 'Usuario no existe' });
  res.json({ ...user, total: countAll.get().total });
});

app.listen(PORT, () => console.log(`Kōhi escuchando en http://localhost:${PORT}`));
