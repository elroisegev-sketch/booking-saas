const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const router = express.Router();

// ── Rate limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // 10 attempts per IP
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי ניסיונות כניסה. נסה שוב בעוד 15 דקות.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי ניסיונות הרשמה. נסה שוב בעוד שעה.' },
});

// ── Helpers ───────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── POST /api/register ────────────────────────────────────────
router.post('/register', registerLimiter, async (req, res) => {
  const { email, password, business_name } = req.body;

  if (!email || !password || !business_name)
    return res.status(400).json({ error: 'Email, password, and business name are required' });
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Invalid email format' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (typeof business_name !== 'string' || business_name.trim().length > 100)
    return res.status(400).json({ error: 'Business name must be 1-100 characters' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email is already registered' });

    let slug = slugify(business_name);
    const slugCheck = await db.query('SELECT id FROM users WHERE slug=$1', [slug]);
    if (slugCheck.rows.length > 0) slug = `${slug}-${Date.now()}`;

    const hash = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (email, password_hash, business_name, slug) VALUES ($1,$2,$3,$4) RETURNING id, email, business_name, slug',
      [email.toLowerCase().trim(), hash, business_name.trim(), slug]
    );
    const user = result.rows[0];

    // Days 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Default: Sun–Thu active, Fri 09:00–14:00, Sat inactive
    const defaultDays = [
      { day: 0, start: '09:00', end: '17:00', active: true  }, // ראשון
      { day: 1, start: '09:00', end: '17:00', active: true  }, // שני
      { day: 2, start: '09:00', end: '17:00', active: true  }, // שלישי
      { day: 3, start: '09:00', end: '17:00', active: true  }, // רביעי
      { day: 4, start: '09:00', end: '17:00', active: true  }, // חמישי
      { day: 5, start: '09:00', end: '14:00', active: false }, // שישי
      { day: 6, start: '09:00', end: '17:00', active: false }, // שבת
    ];
    for (const d of defaultDays) {
      await db.query(
        'INSERT INTO availability (business_id, day_of_week, start_time, end_time, is_active) VALUES ($1,$2,$3,$4,$5)',
        [user.id, d.day, d.start, d.end, d.active]
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── POST /api/login ───────────────────────────────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  if (!EMAIL_RE.test(email))
    return res.status(400).json({ error: 'Invalid email format' });
  if (typeof password !== 'string' || password.length > 200)
    return res.status(400).json({ error: 'Invalid password' });

  try {
    const result = await db.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase().trim()]);
    if (!result.rows.length)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, business_name: user.business_name, slug: user.slug }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── GET /api/me ───────────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, business_name, slug, created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/change-password (auth required)
router.post('/change-password', require('../middleware/auth'), async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8)
    return res.status(400).json({ error: 'סיסמה חייבת להיות לפחות 8 תווים' });
  try {
    const hash = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
