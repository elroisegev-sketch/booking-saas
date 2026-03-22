const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const auth = require('../middleware/auth');
const { sendPush } = require('./push');
const router = express.Router();

// ── Telegram notification ─────────────────────────────────────
function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  console.log('📨 Telegram: token present=', !!token, 'chatId present=', !!chatId);
  if (!token || !chatId) return Promise.resolve();
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: chatId, text: message });
    const https = require('https');
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📨 Telegram response:', res.statusCode, data);
        resolve();
      });
    });
    req.on('error', e => { console.error('📨 Telegram error:', e.message); resolve(); });
    req.write(body);
    req.end();
  });
}

// ── Rate limiter — public booking endpoint ────────────────────
const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי ניסיונות קביעת תור. נסה שוב בעוד שעה.' },
});

// ── Validation helpers ────────────────────────────────────────
const PHONE_RE = /^0[2-9]\d{7,8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ['confirmed', 'cancelled', 'completed', 'pending'];

function isValidISODate(str) {
  if (!str || typeof str !== 'string') return false;
  return !isNaN(new Date(str).getTime());
}

// ── SSE clients: Map<businessId, Set<res>> ────────────────────
const sseClients = new Map();
function notifyBusiness(businessId) {
  const clients = sseClients.get(String(businessId));
  if (!clients) return;
  clients.forEach(res => res.write('data: refresh\n\n'));
}

// GET /api/appointments/stream
router.get('/stream', auth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write('data: connected\n\n');
  const bizId = String(req.user.id);
  if (!sseClients.has(bizId)) sseClients.set(bizId, new Set());
  sseClients.get(bizId).add(res);
  const keepAlive = setInterval(() => res.write(': ping\n\n'), 25000);
  req.on('close', () => { clearInterval(keepAlive); sseClients.get(bizId)?.delete(res); });
});

// GET /api/appointments
router.get('/', auth, async (req, res) => {
  const { date, from, to, status } = req.query;
  if (status && !ALLOWED_STATUSES.includes(status))
    return res.status(400).json({ error: 'Invalid status value' });
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Invalid date format' });
  if (from && !isValidISODate(from)) return res.status(400).json({ error: 'Invalid from date' });
  if (to && !isValidISODate(to)) return res.status(400).json({ error: 'Invalid to date' });
  try {
    let query = `SELECT a.*, s.name AS service_name, s.duration, s.price FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.business_id = $1`;
    const params = [req.user.id];
    if (status) { params.push(status); query += ` AND a.status = $${params.length}`; }
    else { query += ` AND a.status != 'cancelled'`; }
    if (date) { params.push(date); query += ` AND DATE(a.appointment_time) = $${params.length}::date`; }
    else if (from && to) { params.push(from, to); query += ` AND a.appointment_time BETWEEN $${params.length-1}::timestamptz AND $${params.length}::timestamptz`; }
    query += ' ORDER BY a.appointment_time ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/appointments/customers
router.get('/customers', auth, async (req, res) => {
  try {
    const result = await db.query(`SELECT DISTINCT ON (customer_phone) customer_name, customer_phone, customer_email, COUNT(*) OVER (PARTITION BY customer_phone) AS appointment_count, MAX(appointment_time) OVER (PARTITION BY customer_phone) AS last_appointment FROM appointments WHERE business_id=$1 ORDER BY customer_phone, appointment_time DESC`, [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/appointments/slots/:slug/:serviceId/:date
router.get('/slots/:slug/:serviceId/:date', async (req, res) => {
  const { slug, serviceId, date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Invalid date format (YYYY-MM-DD)' });
  const rawDuration = parseInt(req.query.totalDuration);
  const totalDuration = (!isNaN(rawDuration) && rawDuration > 0 && rawDuration <= 480) ? rawDuration : null;
  try {
    const businessResult = await db.query('SELECT id FROM users WHERE slug=$1', [slug]);
    if (!businessResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const businessId = businessResult.rows[0].id;
    const serviceResult = await db.query('SELECT duration FROM services WHERE id=$1 AND business_id=$2 AND is_active=true', [serviceId, businessId]);
    if (!serviceResult.rows.length) return res.status(404).json({ error: 'Service not found' });
    const duration = totalDuration || serviceResult.rows[0].duration;
    const dateParts = date.split('-').map(Number);
    const dayOfWeek = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDay();
    const availResult = await db.query('SELECT start_time, end_time FROM availability WHERE business_id=$1 AND day_of_week=$2 AND is_active=true', [businessId, dayOfWeek]);
    if (!availResult.rows.length) return res.json({ slots: [] });
    const { start_time, end_time } = availResult.rows[0];
    const bookedResult = await db.query(`SELECT appointment_time, end_time FROM appointments WHERE business_id=$1 AND status != 'cancelled' AND DATE(appointment_time) = $2::date`, [businessId, date]);
    const blockedResult = await db.query(`SELECT start_time, end_time FROM blocked_slots WHERE business_id=$1 AND date=$2::date`, [businessId, date]);
    const INTERVAL = 30;
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const refDate = new Date(`${date}T12:00:00Z`);
    const israelLocal = new Date(refDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const israelOffsetMins = Math.round((israelLocal - refDate) / 60000);
    const startMinsUTC = sh * 60 + sm - israelOffsetMins;
    const endMinsUTC   = eh * 60 + em - israelOffsetMins;
    const now = new Date();
    const slots = [];
    for (let m = startMinsUTC; m + duration <= endMinsUTC; m += INTERVAL) {
      const utcH = Math.floor(((m % 1440) + 1440) % 1440 / 60);
      const utcM = ((m % 60) + 60) % 60;
      const hh = String(utcH).padStart(2, '0');
      const mm = String(utcM).padStart(2, '0');
      const slotStart = new Date(`${date}T${hh}:${mm}:00Z`);
      const slotEnd   = new Date(slotStart.getTime() + duration * 60000);
      if (slotStart <= now) continue;
      const conflict = bookedResult.rows.some(b => slotStart < new Date(b.end_time) && slotEnd > new Date(b.appointment_time));
      const blocked = blockedResult.rows.some(bl => {
        const [bsh, bsm] = bl.start_time.split(':').map(Number);
        const [beh, bem] = bl.end_time.split(':').map(Number);
        const blockStart = new Date(`${date}T${String(bsh - Math.floor(israelOffsetMins/60)).padStart(2,'0')}:${String(bsm).padStart(2,'0')}:00Z`);
        const blockEnd   = new Date(`${date}T${String(beh - Math.floor(israelOffsetMins/60)).padStart(2,'0')}:${String(bem).padStart(2,'0')}:00Z`);
        return slotStart < blockEnd && slotEnd > blockStart;
      });
      if (!conflict && !blocked) {
        const localH = String(slotStart.getUTCHours() + Math.floor(israelOffsetMins / 60)).padStart(2, '0');
        const localM = String(slotStart.getUTCMinutes()).padStart(2, '0');
        slots.push(`${localH}:${localM}`);
      }
    }
    res.json({ slots });
  } catch (err) { console.error('Slots error:', err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/appointments (public booking)
router.post('/', bookingLimiter, async (req, res) => {
  const { business_slug, service_id, customer_name, customer_phone, customer_email, appointment_time } = req.body;
  if (!business_slug || !service_id || !customer_name || !customer_phone || !appointment_time)
    return res.status(400).json({ error: 'Missing required fields' });
  if (typeof customer_name !== 'string' || customer_name.trim().length < 2 || customer_name.trim().length > 100)
    return res.status(400).json({ error: 'שם לא תקין (2-100 תווים)' });
  const cleanPhone = customer_phone.replace(/[-\s]/g, '');
  if (!PHONE_RE.test(cleanPhone))
    return res.status(400).json({ error: 'מספר טלפון לא תקין' });
  if (customer_email && !EMAIL_RE.test(customer_email))
    return res.status(400).json({ error: 'כתובת אימייל לא תקינה' });
  if (!isValidISODate(appointment_time))
    return res.status(400).json({ error: 'תאריך ושעה לא תקינים' });
  const apptDate = new Date(appointment_time);
  if (apptDate < new Date())
    return res.status(400).json({ error: 'לא ניתן לקבוע תור לתאריך שעבר' });
  const oneYearFromNow = new Date(); oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (apptDate > oneYearFromNow)
    return res.status(400).json({ error: 'לא ניתן לקבוע תור ליותר משנה מראש' });
  try {
    const businessResult = await db.query('SELECT id FROM users WHERE slug=$1', [business_slug]);
    if (!businessResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const businessId = businessResult.rows[0].id;
    const serviceResult = await db.query('SELECT * FROM services WHERE id=$1 AND business_id=$2 AND is_active=true', [service_id, businessId]);
    if (!serviceResult.rows.length) return res.status(404).json({ error: 'Service not found' });
    const service = serviceResult.rows[0];
    const startTime = new Date(appointment_time);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    const conflictResult = await db.query(`SELECT id FROM appointments WHERE business_id = $1 AND status != 'cancelled' AND tstzrange(appointment_time, end_time, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')`, [businessId, startTime.toISOString(), endTime.toISOString()]);
    if (conflictResult.rows.length > 0) return res.status(409).json({ error: 'This time slot is no longer available.' });
    const result = await db.query(`INSERT INTO appointments (business_id, service_id, customer_name, customer_phone, customer_email, appointment_time, end_time, status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`, [businessId, service_id, customer_name.trim(), cleanPhone, customer_email?.trim() || null, startTime.toISOString(), endTime.toISOString()]);
    const israelTime = new Date(startTime.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const dateHeb = israelTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeHeb = `${String(israelTime.getHours()).padStart(2,'0')}:${String(israelTime.getMinutes()).padStart(2,'0')}`;
    const deposit = Math.ceil(parseFloat(service.price) / 2);
    const telegramMsg = `🌸 תור חדש!\n\n👤 שם: ${customer_name.trim()}\n💅 טיפול: ${service.name}\n📅 תאריך: ${dateHeb}\n🕐 שעה: ${timeHeb}\n💰 מחיר: ${service.price}₪\n💳 מקדמה: ${deposit}₪`;
    await sendTelegram(telegramMsg);
    await sendPush({ title: '🌸 תור חדש!', body: `${customer_name} | ${service.name}\n${dateHeb} בשעה ${timeHeb}` });
    notifyBusiness(businessId);
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Book appointment error:', err); res.status(500).json({ error: 'Server error while booking appointment' }); }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  try {
    const result = await db.query('UPDATE appointments SET status=$1 WHERE id=$2 AND business_id=$3 RETURNING *', [status, req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
