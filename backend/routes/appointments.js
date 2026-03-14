const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { sendPush } = require('./push');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { date, from, to, status } = req.query;
  try {
    let query = `
      SELECT a.*, s.name AS service_name, s.duration, s.price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.business_id = $1
    `;
    const params = [req.user.id];
    if (status) { params.push(status); query += ` AND a.status = $${params.length}`; }
    else { query += ` AND a.status != 'cancelled'`; }
    if (date) { params.push(date); query += ` AND DATE(a.appointment_time) = $${params.length}::date`; }
    else if (from && to) { params.push(from, to); query += ` AND a.appointment_time BETWEEN $${params.length-1}::timestamptz AND $${params.length}::timestamptz`; }
    query += ' ORDER BY a.appointment_time ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/customers', auth, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT ON (customer_phone)
        customer_name, customer_phone, customer_email,
        COUNT(*) OVER (PARTITION BY customer_phone) AS appointment_count,
        MAX(appointment_time) OVER (PARTITION BY customer_phone) AS last_appointment
      FROM appointments
      WHERE business_id=$1
      ORDER BY customer_phone, appointment_time DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/slots/:slug/:serviceId/:date', async (req, res) => {
  const { slug, serviceId, date } = req.params;
  try {
    const businessResult = await db.query('SELECT id FROM users WHERE slug=$1', [slug]);
    if (!businessResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const businessId = businessResult.rows[0].id;
    const serviceResult = await db.query('SELECT duration FROM services WHERE id=$1 AND business_id=$2', [serviceId, businessId]);
    if (!serviceResult.rows.length) return res.status(404).json({ error: 'Service not found' });
    const duration = serviceResult.rows[0].duration;
    const dateParts = date.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = dateObj.getDay();
    const availResult = await db.query('SELECT start_time, end_time FROM availability WHERE business_id=$1 AND day_of_week=$2 AND is_active=true', [businessId, dayOfWeek]);
    if (!availResult.rows.length) return res.json({ slots: [] });
    const { start_time, end_time } = availResult.rows[0];
    const bookedResult = await db.query(`SELECT appointment_time, end_time FROM appointments WHERE business_id=$1 AND status != 'cancelled' AND DATE(appointment_time) = $2::date`, [businessId, date]);
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const slots = [];
    const now = new Date();
    for (let m = startMins; m + duration <= endMins; m += duration) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      const slotStart = new Date(`${date}T${hh}:${mm}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      if (slotStart <= now) continue;
      const conflict = bookedResult.rows.some(b => {
        const bs = new Date(b.appointment_time);
        const be = new Date(b.end_time);
        return slotStart < be && slotEnd > bs;
      });
      if (!conflict) slots.push(slotStart.toISOString());
    }
    res.json({ slots });
  } catch (err) {
    console.error('Slots error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { business_slug, service_id, customer_name, customer_phone, customer_email, appointment_time } = req.body;
  if (!business_slug || !service_id || !customer_name || !customer_phone || !appointment_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const businessResult = await db.query('SELECT id FROM users WHERE slug=$1', [business_slug]);
    if (!businessResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const businessId = businessResult.rows[0].id;
    const serviceResult = await db.query('SELECT * FROM services WHERE id=$1 AND business_id=$2 AND is_active=true', [service_id, businessId]);
    if (!serviceResult.rows.length) return res.status(404).json({ error: 'Service not found' });
    const service = serviceResult.rows[0];
    const startTime = new Date(appointment_time);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    const conflictResult = await db.query(`
      SELECT id FROM appointments
      WHERE business_id = $1 AND status != 'cancelled'
      AND tstzrange(appointment_time, end_time, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')
    `, [businessId, startTime.toISOString(), endTime.toISOString()]);
    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available.' });
    }
    const result = await db.query(`
      INSERT INTO appointments (business_id, service_id, customer_name, customer_phone, customer_email, appointment_time, end_time)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [businessId, service_id, customer_name.trim(), customer_phone.trim(), customer_email?.trim() || null, startTime.toISOString(), endTime.toISOString()]);

    // 🔔 שלח התראה לליאור
    const dateHeb = startTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeHeb = startTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    await sendPush({
      title: '🌸 תור חדש!',
      body: `${customer_name} | ${service.name}\n${dateHeb} בשעה ${timeHeb}`
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ error: 'Server error while booking appointment' });
  }
});

router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed', 'cancelled', 'completed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const result = await db.query('UPDATE appointments SET status=$1 WHERE id=$2 AND business_id=$3 RETURNING *', [status, req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
