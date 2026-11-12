-- Esquema de kohi.db (la base no se versiona: contiene datos de prueba).
-- Crear con: sqlite3 kohi.db < schema.sql
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  position INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
