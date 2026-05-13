const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month))
    return res.status(400).json({ error: 'month param required (YYYY-MM)' });
  try {
    const result = await db.query(
      `SELECT id, description, amount, created_at FROM expenses
       WHERE business_id=$1 AND month=$2 ORDER BY created_at ASC`,
      [req.user.id, month]
    );
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auth, async (req, res) => {
  const { description, amount, month } = req.body;
  if (!description || typeof description !== 'string' || description.trim().length === 0)
    return res.status(400).json({ error: 'תיאור ריק' });
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
    return res.status(400).json({ error: 'סכום לא תקין' });
  if (!month || !/^\d{4}-\d{2}$/.test(month))
    return res.status(400).json({ error: 'month required (YYYY-MM)' });
  try {
    const result = await db.query(
      `INSERT INTO expenses (business_id, description, amount, month)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, description.trim(), parseFloat(amount), month]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM expenses WHERE id=$1 AND business_id=$2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
