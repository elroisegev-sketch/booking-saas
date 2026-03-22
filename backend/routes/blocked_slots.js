const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/blocked-slots?month=YYYY-MM
router.get('/', auth, async (req, res) => {
  try {
    const { month } = req.query;
    let result;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      result = await db.query(
        `SELECT * FROM blocked_slots WHERE business_id=$1 AND date >= $2::date AND date < ($2::date + INTERVAL '1 month') ORDER BY date, start_time`,
        [req.user.id, month + '-01']
      );
    } else {
      result = await db.query(
        `SELECT * FROM blocked_slots WHERE business_id=$1 AND date >= CURRENT_DATE ORDER BY date, start_time`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/blocked-slots
router.post('/', auth, async (req, res) => {
  const { date, start_time, end_time, reason } = req.body;
  if (!date || !start_time || !end_time) return res.status(400).json({ error: 'date, start_time, end_time required' });
  try {
    const result = await db.query(
      `INSERT INTO blocked_slots (business_id, date, start_time, end_time, reason) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, date, start_time, end_time, reason || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/blocked-slots/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(`DELETE FROM blocked_slots WHERE id=$1 AND business_id=$2`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
