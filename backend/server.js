require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS — whitelist only known origins ───────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://authentic-wisdom-production.up.railway.app',
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
app.use(express.json({ limit: '50kb' }));

// ── Global rate limit — 200 req / 15 min per IP ───────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי בקשות, נסה שוב בעוד מעט' },
}));

// ── Routes ────────────────────────────────────────────────────
app.use('/api', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/push', require('./routes/push').router);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'BookSlot API' }));

// ── JWT secret strength check on startup ─────────────────────
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('⚠️  WARNING: JWT_SECRET is missing or too short (min 32 chars). Set a strong secret in production!');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🗓  BookSlot API running on http://localhost:${PORT}`));
