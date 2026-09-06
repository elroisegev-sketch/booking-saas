const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/services - authenticated business's services
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM services WHERE business_id=$1 AND is_active=true ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});



function parseReturnDays(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1 || n > 365) return undefined;
  return n;
}

// POST /api/services
router.post('/', auth, async (req, res) => {
  const { name, duration, price, category } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Service name and duration are required' });
  }
  if (isNaN(duration) || duration < 5 || duration > 480) {
    return res.status(400).json({ error: 'Duration must be between 5 and 480 minutes' });
  }
  const recMin = parseReturnDays(req.body.recommended_return_days_min);
  const recMax = parseReturnDays(req.body.recommended_return_days_max);
  if (recMin === undefined || recMax === undefined) {
    return res.status(400).json({ error: 'ימי חזרה חייבים להיות בין 1 ל-365' });
  }
  try {
    const result = await db.query(
      'INSERT INTO services (business_id, name, duration, price, category, recommended_return_days_min, recommended_return_days_max) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.user.id, name.trim(), parseInt(duration), parseFloat(price) || 0, category || 'כללי', recMin, recMax]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/services/:id
router.put('/:id', auth, async (req, res) => {
  const { name, duration, price, is_active, category } = req.body;
  const recMin = req.body.recommended_return_days_min !== undefined
    ? parseReturnDays(req.body.recommended_return_days_min)
    : 'keep';
  const recMax = req.body.recommended_return_days_max !== undefined
    ? parseReturnDays(req.body.recommended_return_days_max)
    : 'keep';
  if (recMin === undefined || recMax === undefined) {
    return res.status(400).json({ error: 'ימי חזרה חייבים להיות בין 1 ל-365' });
  }
  try {
    const result = await db.query(
      `UPDATE services
       SET name=COALESCE($1,name), duration=COALESCE($2,duration),
           price=COALESCE($3,price), is_active=COALESCE($4,is_active),
           category=COALESCE($5,category),
           recommended_return_days_min=CASE WHEN $6::text = 'keep' THEN recommended_return_days_min ELSE $7 END,
           recommended_return_days_max=CASE WHEN $8::text = 'keep' THEN recommended_return_days_max ELSE $9 END
       WHERE id=$10 AND business_id=$11
       RETURNING *`,
      [name, duration ? parseInt(duration) : null, price !== undefined ? parseFloat(price) : null,
       is_active, category || null,
       recMin === 'keep' ? 'keep' : 'set', recMin === 'keep' ? null : recMin,
       recMax === 'keep' ? 'keep' : 'set', recMax === 'keep' ? null : recMax,
       req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/services/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    // Soft delete - deactivate instead of removing (preserves appointment history)
    await db.query(
      'UPDATE services SET is_active=false WHERE id=$1 AND business_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services/public/:slug - public services list
router.get('/public/:slug', async (req, res) => {
  try {
    const businessResult = await db.query('SELECT id FROM users WHERE slug=$1', [req.params.slug]);
    if (!businessResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const result = await db.query(
      'SELECT * FROM services WHERE business_id=$1 AND is_active=true ORDER BY category, name',
      [businessResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
