const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// GET /api/availability
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM availability WHERE business_id=$1 ORDER BY day_of_week',
      [req.user.id]
    );
    // Return all 7 days, even if not configured
    const map = {};
    result.rows.forEach(r => { map[r.day_of_week] = r; });
    const all = Array.from({ length: 7 }, (_, i) => map[i] || {
      day_of_week: i,
      day_name: DAY_NAMES[i],
      start_time: '09:00',
      end_time: '17:00',
      is_active: false,
    });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/availability/public/:slug - public availability
router.get('/public/:slug', async (req, res) => {
  try {
    const userResult = await db.query('SELECT id FROM users WHERE slug=$1', [req.params.slug]);
    if (!userResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const result = await db.query(
      'SELECT day_of_week, start_time, end_time FROM availability WHERE business_id=$1 AND is_active=true',
      [userResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/availability/:dayOfWeek
router.put('/:dayOfWeek', auth, async (req, res) => {
  const dayOfWeek = parseInt(req.params.dayOfWeek);
  if (isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    return res.status(400).json({ error: 'Invalid day of week (0-6)' });
  }
  const { start_time, end_time, is_active } = req.body;
  try {
    const result = await db.query(`
      INSERT INTO availability (business_id, day_of_week, start_time, end_time, is_active)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (business_id, day_of_week)
      DO UPDATE SET start_time=$3, end_time=$4, is_active=$5
      RETURNING *
    `, [req.user.id, dayOfWeek, start_time || '09:00', end_time || '17:00', is_active !== undefined ? is_active : true]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/availability/bulk - update all days at once
router.put('/bulk', auth, async (req, res) => {
  const { days } = req.body; // array of { day_of_week, start_time, end_time, is_active }
  if (!Array.isArray(days)) return res.status(400).json({ error: 'days array required' });
  try {
    const results = await Promise.all(days.map(d =>
      db.query(`
        INSERT INTO availability (business_id, day_of_week, start_time, end_time, is_active)
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (business_id, day_of_week)
        DO UPDATE SET start_time=$3, end_time=$4, is_active=$5
        RETURNING *
      `, [req.user.id, d.day_of_week, d.start_time, d.end_time, d.is_active])
    ));
    res.json(results.map(r => r.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
