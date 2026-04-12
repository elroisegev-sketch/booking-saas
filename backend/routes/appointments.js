const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const auth = require('../middleware/auth');
const { sendPush } = require('./push');
const router = express.Router();

// ── Hebrew natural-language appointment parser ─────────────────
function parseHebrewText(text) {
  let rem = text.trim();

  // 1. Extract definite time patterns first (HH:MM)
  let hour = null, minute = 0;
  let m = rem.match(/ב[-–]?(\d{1,2}):(\d{2})/);
  if (m) { hour = parseInt(m[1]); minute = parseInt(m[2]); rem = rem.replace(m[0], ' '); }

  if (hour === null) {
    m = rem.match(/בשעה\s+(\d{1,2})(?::(\d{2}))?/);
    if (m) { hour = parseInt(m[1]); minute = m[2] ? parseInt(m[2]) : 0; rem = rem.replace(m[0], ' '); }
  }

  // 2. Extract date
  const todayBase = new Date(); todayBase.setHours(0, 0, 0, 0);
  let date = null;

  if (/מחרתיים/.test(rem)) {
    date = new Date(todayBase); date.setDate(date.getDate() + 2);
    rem = rem.replace(/מחרתיים/, ' ');
  } else if (/מחר/.test(rem)) {
    date = new Date(todayBase); date.setDate(date.getDate() + 1);
    rem = rem.replace(/מחר/, ' ');
  } else if (/היום/.test(rem)) {
    date = new Date(todayBase);
    rem = rem.replace(/היום/, ' ');
  }

  const dayMap = [['ראשון',0],['שני',1],['שלישי',2],['רביעי',3],['חמישי',4],['שישי',5],['שבת',6]];
  if (!date) {
    for (const [name, dow] of dayMap) {
      const re = new RegExp('ביום ' + name + '|יום ' + name);
      if (re.test(rem)) {
        const diff = ((dow - todayBase.getDay() + 7) % 7) || 7;
        date = new Date(todayBase); date.setDate(date.getDate() + diff);
        rem = rem.replace(re, ' '); break;
      }
    }
  }

  const monthMap = {'ינואר':1,'פברואר':2,'מרץ':3,'מארס':3,'אפריל':4,'מאי':5,'יוני':6,'יולי':7,'אוגוסט':8,'ספטמבר':9,'אוקטובר':10,'נובמבר':11,'דצמבר':12};
  if (!date) {
    for (const [mn, mo] of Object.entries(monthMap)) {
      m = rem.match(new RegExp('ב[-–]?(\\d{1,2})\\s*ל?' + mn));
      if (m) {
        const yr = todayBase.getFullYear();
        date = new Date(yr, mo - 1, parseInt(m[1]));
        if (date < todayBase) date.setFullYear(yr + 1);
        rem = rem.replace(m[0], ' '); break;
      }
    }
  }

  if (!date) {
    m = rem.match(/(\d{1,2})[\/.](\d{1,2})(?!\d)/);
    if (m) {
      const d = parseInt(m[1]), mo = parseInt(m[2]);
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
        const yr = todayBase.getFullYear();
        date = new Date(yr, mo - 1, d);
        if (date < todayBase) date.setFullYear(yr + 1);
        rem = rem.replace(m[0], ' ');
      }
    }
  }

  // 3. Ambiguous ב-N (time only if not next to month keyword and hour not found yet)
  if (hour === null) {
    m = rem.match(/ב[-–](\d{1,2})(?!\d|[\/.]|\s*ל[\u05d0-\u05ea])/);
    if (m) { hour = parseInt(m[1]); minute = 0; rem = rem.replace(m[0], ' '); }
  }

  // Default date: today if time is in future, else tomorrow
  if (!date) {
    const now = new Date();
    date = new Date(todayBase);
    if (hour !== null && (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes()))) {
      date.setDate(date.getDate() + 1);
    }
  }

  // 4. Extract service (longest match first)
  const services = ["לק ג'ל",'לק גל','מניקור','פדיקור','עיצוב גבות','הרמת ריסים','קישוט','ריסים','גבות',"ג'ל",'ג\'ל','ספא ידיים','ספא רגליים'];
  let service_name = null;
  for (const svc of services) {
    if (rem.includes(svc)) { service_name = svc; rem = rem.replace(svc, ' '); break; }
  }

  // 5. Name = what's left
  const customer_name = rem.replace(/\s+/g, ' ').trim().replace(/^[-–,\s]+|[-–,\s]+$/g, '');

  return { customer_name: customer_name || null, service_name: service_name || 'טיפול', date, hour, minute };
}

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
    let query = `SELECT a.*, s.name AS service_name, s.duration, COALESCE(a.total_price, s.price) AS price FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.business_id = $1`;
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
  const { business_slug, service_id, customer_name, customer_phone, customer_email, appointment_time, service_names, total_price, total_duration } = req.body;
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
    const durationMins = (total_duration && parseInt(total_duration) > 0) ? parseInt(total_duration) : service.duration;
    const endTime = new Date(startTime.getTime() + durationMins * 60000);
    const conflictResult = await db.query(`SELECT id FROM appointments WHERE business_id = $1 AND status != 'cancelled' AND tstzrange(appointment_time, end_time, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')`, [businessId, startTime.toISOString(), endTime.toISOString()]);
    if (conflictResult.rows.length > 0) return res.status(409).json({ error: 'This time slot is no longer available.' });
    const displayNames = service_names || service.name;
    const displayPrice = parseFloat(total_price) || parseFloat(service.price);
    const result = await db.query(`INSERT INTO appointments (business_id, service_id, customer_name, customer_phone, customer_email, appointment_time, end_time, status, service_names_text, total_price) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9) RETURNING *`, [businessId, service_id, customer_name.trim(), cleanPhone, customer_email?.trim() || null, startTime.toISOString(), endTime.toISOString(), displayNames, displayPrice]);
    const israelTime = new Date(startTime.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
    const dateHeb = israelTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeHeb = `${String(israelTime.getHours()).padStart(2,'0')}:${String(israelTime.getMinutes()).padStart(2,'0')}`;
    const deposit = Math.ceil(displayPrice / 2);
    const telegramMsg = `🌸 תור חדש!\n\n👤 שם: ${customer_name.trim()}\n💅 טיפול: ${displayNames}\n📅 תאריך: ${dateHeb}\n🕐 שעה: ${timeHeb}\n💰 מחיר: ${displayPrice}₪\n💳 מקדמה: ${deposit}₪`;
    await sendTelegram(telegramMsg);
    await sendPush({ title: '🌸 תור חדש!', body: `${customer_name} | ${displayNames}\n${dateHeb} בשעה ${timeHeb}` });
    notifyBusiness(businessId);
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error('Book appointment error:', err); res.status(500).json({ error: 'Server error while booking appointment' }); }
});

// PATCH /api/appointments/:id  (edit full appointment, auth required)
router.patch('/:id', auth, async (req, res) => {
  const { appointment_time, service_id, service_ids, customer_name, customer_phone } = req.body;
  const ids = service_ids?.length ? service_ids : (service_id ? [service_id] : null);
  try {
    const curr = await db.query(
      `SELECT a.*, s.duration FROM appointments a JOIN services s ON a.service_id = s.id WHERE a.id=$1 AND a.business_id=$2`,
      [req.params.id, req.user.id]
    );
    if (!curr.rows.length) return res.status(404).json({ error: 'Appointment not found' });
    const appt = curr.rows[0];

    let totalDuration = appt.duration;
    let newServiceId = appt.service_id;
    let serviceNamesText = appt.service_names_text;

    if (ids) {
      const svcResult = await db.query(
        `SELECT id, name, duration FROM services WHERE id = ANY($1::int[]) AND business_id=$2`,
        [ids, req.user.id]
      );
      if (svcResult.rows.length !== ids.length) return res.status(404).json({ error: 'שירות לא נמצא' });
      // preserve order as sent
      const svcMap = Object.fromEntries(svcResult.rows.map(s => [String(s.id), s]));
      const ordered = ids.map(i => svcMap[String(i)]).filter(Boolean);
      totalDuration = ordered.reduce((sum, s) => sum + s.duration, 0);
      newServiceId = ordered[0].id;
      serviceNamesText = ordered.map(s => s.name).join(' + ');
    }

    const newStart = appointment_time ? new Date(appointment_time) : new Date(appt.appointment_time);
    if (appointment_time && isNaN(newStart.getTime())) return res.status(400).json({ error: 'תאריך לא תקין' });
    const newEnd = new Date(newStart.getTime() + totalDuration * 60000);

    const conflict = await db.query(
      `SELECT id FROM appointments WHERE business_id=$1 AND id!=$2 AND status!='cancelled' AND tstzrange(appointment_time,end_time,'[)') && tstzrange($3::timestamptz,$4::timestamptz,'[)')`,
      [req.user.id, req.params.id, newStart.toISOString(), newEnd.toISOString()]
    );
    if (conflict.rows.length) return res.status(409).json({ error: 'השעה הזו תפוסה' });

    const newName = customer_name?.trim() || appt.customer_name;
    const newPhone = customer_phone ? customer_phone.replace(/[-\s]/g, '') : appt.customer_phone;

    const result = await db.query(
      `UPDATE appointments SET appointment_time=$1, end_time=$2, service_id=$3, service_names_text=$4, customer_name=$5, customer_phone=$6 WHERE id=$7 AND business_id=$8 RETURNING *`,
      [newStart.toISOString(), newEnd.toISOString(), newServiceId, serviceNamesText, newName, newPhone, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Edit appointment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/appointments/manual — admin manual booking (no service_id required)
router.post('/manual', auth, async (req, res) => {
  const { customer_name, service_name, appointment_time, price, deposit, notes } = req.body;
  if (!customer_name || !appointment_time) return res.status(400).json({ error: 'Missing required fields' });
  if (typeof customer_name !== 'string' || customer_name.trim().length < 2) return res.status(400).json({ error: 'שם לא תקין' });
  if (!isValidISODate(appointment_time)) return res.status(400).json({ error: 'תאריך לא תקין' });
  try {
    const result = await db.query(
      `INSERT INTO appointments (business_id, customer_name, service_name, appointment_time, end_time, status, price, notes)
       VALUES ($1,$2,$3,$4,$5,'confirmed',$6,$7) RETURNING *`,
      [
        req.user.id,
        customer_name.trim(),
        service_name || 'טיפול',
        new Date(appointment_time).toISOString(),
        new Date(new Date(appointment_time).getTime() + 60 * 60000).toISOString(),
        parseFloat(price) || 0,
        notes || null,
      ]
    );
    notifyBusiness(req.user.id);
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
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

// POST /api/appointments/quick-add — parse Hebrew text, check conflicts, create appointment
router.post('/quick-add', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0)
    return res.status(400).json({ error: 'טקסט ריק' });

  const parsed = parseHebrewText(text);

  if (!parsed.customer_name)
    return res.status(400).json({ error: 'לא זיהיתי שם לקוחה', parsed });
  if (parsed.hour === null)
    return res.status(400).json({ error: 'לא זיהיתי שעה', parsed });

  const apptTime = new Date(parsed.date);
  apptTime.setHours(parsed.hour, parsed.minute, 0, 0);
  const apptEnd = new Date(apptTime.getTime() + 60 * 60 * 1000);

  try {
    // Check conflict
    const conflict = await db.query(
      `SELECT customer_name, service_name, appointment_time FROM appointments
       WHERE business_id=$1 AND status!='cancelled'
         AND appointment_time < $2 AND (appointment_time + interval '60 minutes') > $3`,
      [req.user.id, apptEnd.toISOString(), apptTime.toISOString()]
    );

    if (conflict.rows.length > 0) {
      // Find free slots that day
      const dayStart = new Date(parsed.date); dayStart.setHours(9, 0, 0, 0);
      const dayEnd   = new Date(parsed.date); dayEnd.setHours(21, 0, 0, 0);
      const taken = await db.query(
        `SELECT appointment_time FROM appointments
         WHERE business_id=$1 AND status!='cancelled'
           AND appointment_time >= $2 AND appointment_time < $3
         ORDER BY appointment_time`,
        [req.user.id, dayStart.toISOString(), dayEnd.toISOString()]
      );
      const takenHours = new Set(taken.rows.map(r => new Date(r.appointment_time).getHours()));
      const free = [];
      for (let h = 9; h <= 20; h++) {
        if (!takenHours.has(h)) free.push(h < 10 ? '0' + h + ':00' : h + ':00');
      }
      return res.status(409).json({
        error: 'השעה תפוסה',
        conflictWith: conflict.rows[0].customer_name + ' — ' + conflict.rows[0].service_name,
        freeSlots: free.slice(0, 6),
        parsed,
      });
    }

    // Create
    const result = await db.query(
      `INSERT INTO appointments (business_id, customer_name, service_name, appointment_time, end_time, status, price)
       VALUES ($1,$2,$3,$4,$5,'confirmed',0) RETURNING *`,
      [req.user.id, parsed.customer_name, parsed.service_name, apptTime.toISOString(), apptEnd.toISOString()]
    );
    notifyBusiness(req.user.id);
    res.status(201).json({ appointment: result.rows[0], parsed });
  } catch (err) {
    console.error('quick-add error:', err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// POST /api/appointments/parse-text — AI appointment parser (uses ANTHROPIC_API_KEY from backend env)
router.post('/parse-text', auth, async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0)
    return res.status(400).json({ error: 'טקסט ריק' });
  if (text.length > 1000)
    return res.status(400).json({ error: 'הטקסט ארוך מדי (מקסימום 1000 תווים)' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('[parse-text] apiKey present:', !!apiKey, 'length:', apiKey ? apiKey.length : 0);
  if (!apiKey)
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY לא מוגדר' });

  const currentYear = new Date().getFullYear();
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: 'Return only valid JSON. No markdown, no explanations.',
        messages: [{
          role: 'user',
          content: `Parse the following Hebrew appointment text and return a JSON object with these fields:
- customer_name (string): the customer's full name
- service_name (string): the service/treatment name
- date (string): date in YYYY-MM-DD format, current year is ${currentYear}
- time (string): time in HH:MM 24-hour format
- price (number): total price as a number, or 0 if not mentioned
- deposit (number): deposit/advance payment as a number, or 0 if not mentioned

Examples:
"אתל חיים, לק גל, בשעה 12 בתאריך ה16 למאי"
"שרה כהן, הרמת ריסים, 20/5 ב-14:30, 200₪"

Text to parse:
${text}`,
        }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[parse-text] Anthropic error:', response.status, errBody);
      return res.status(500).json({ error: 'שגיאה בקריאה ל-AI', status: response.status, detail: errBody });
    }

    const data = await response.json();
    const content = data && data.content && data.content[0] && data.content[0].text;
    if (!content) return res.status(500).json({ error: 'תגובה ריקה מה-AI' });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(400).json({ error: 'לא ניתן לפרסר את הטקסט' });
    }
    res.json(parsed);
  } catch (err) {
    console.error('parse-text error:', err);
    res.status(500).json({ error: 'שגיאת שרת' });
  }
});

// PATCH /api/appointments/:id/notes
router.patch('/:id/notes', auth, async (req, res) => {
  const { notes } = req.body;
  if (typeof notes !== 'string') return res.status(400).json({ error: 'notes must be a string' });
  if (notes.length > 1000) return res.status(400).json({ error: 'notes too long (max 1000 chars)' });
  try {
    const result = await db.query('UPDATE appointments SET notes=$1 WHERE id=$2 AND business_id=$3 RETURNING *', [notes, req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
