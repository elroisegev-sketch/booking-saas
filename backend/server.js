require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────
app.use(helmet({
  // 1. Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://authentic-wisdom-production.up.railway.app"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://booking-saas-production-b9fd.up.railway.app"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  // 2. Anti-clickjacking
  frameguard: { action: 'deny' },
  // 3. Remove X-Powered-By
  hidePoweredBy: true,
  // 4. X-Content-Type-Options: nosniff
  noSniff: true,
}));

// ── CORS — whitelist only known origins ───────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://www.lioryourbeauty.com',
  'https://lioryourbeauty.com',
  'https://authentic-wisdom-production.up.railway.app',
  'https://www.lioryourbeauty.com',
  'https://lioryourbeauty.com',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server / curl in dev (no origin header)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body size limit (prevent oversized JSON DoS) ──────────────
const galleryRouter = require('./routes/gallery');
app.use('/api/gallery', express.json({ limit: '3mb' }), galleryRouter);
app.use(express.json({ limit: '50kb' }));

// ── Global rate limit — 100 req / 15 min per IP ───────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות, נסה שוב בעוד מעט' },
}));

// ── Admin rate limit — 10 req / 15 min per IP ─────────────────
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות לאדמין, נסה שוב בעוד מעט' },
});
app.use('/api/admin', adminLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/blocked-slots', require('./routes/blocked_slots'));
app.use('/api/push', require('./routes/push').router);
app.use('/api/expenses', require('./routes/expenses'));

// Gallery table + seed flag on users
require('./db').query(`
  CREATE TABLE IF NOT EXISTS gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    mime VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error('gallery_images migration error:', err));
require('./db').query(`CREATE INDEX IF NOT EXISTS idx_gallery_business ON gallery_images(business_id, sort_order)`).catch(() => {});

const db = require('./db');
const { seedLegacyGalleryIfNeeded } = require('./lib/seedGallery');
seedLegacyGalleryIfNeeded(db).catch((err) => console.error('gallery seed error:', err));

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'BookSlot API' }));

// Auto-migrate notes column on appointments
require('./db').query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT`).catch(() => {});

// Multi-service names text column
require('./db').query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_names_text TEXT`).catch(() => {});
require('./db').query(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS total_price NUMERIC`).catch(() => {});

// Expenses table migration
require('./db').query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error('expenses migration error:', err));

// Allow manual appointments without service_id (make it nullable)
require('./db').query(`ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL`).catch(() => {});

// Auto-migrate blocked_slots table
require('./db').query(`
  CREATE TABLE IF NOT EXISTS blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(err => console.error('Migration error:', err));

// ── JWT secret strength check on startup ─────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('⚠️  WARNING: JWT_SECRET is missing or too short (min 32 chars). Set a strong secret in production!');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`🗓  BookSlot API running on http://localhost:${PORT}`);
  // Validate DB schema on startup – catches SQL column-name bugs before they hit users
  try {
    await require('./db').query(`
      SELECT a.id, a.total_price, a.service_names_text,
             COALESCE(s.name, a.service_names_text, 'test') AS service_name,
             COALESCE(a.total_price, s.price, 0) AS price
      FROM appointments a LEFT JOIN services s ON a.service_id = s.id LIMIT 1
    `);
    console.log('✅ DB schema validation passed');
  } catch (err) {
    console.error('🚨 DB SCHEMA VALIDATION FAILED:', err.message);
  }
});
