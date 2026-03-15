const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/services - authenticated business's services
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM services WHERE business_id=$1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/services/public/:slug - public services for booking page
router.get('/public/:slug', async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, business_name, slug FROM users WHERE slug=$1',
      [req.params.slug]
    );
    if (!userResult.rows.length) return res.status(404).json({ error: 'Business not found' });
    const business = userResult.rows[0];
    const services = await db.query(
      'SELECT id, name, duration, price FROM services WHERE business_id=$1 AND is_active=true ORDER BY name',
      [business.id]
    );
    res.json({ business, services: services.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/services
router.post('/', auth, async (req, res) => {
  const { name, duration, price } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Service name and duration are required' });
  }
  if (isNaN(duration) || duration < 5 || duration > 480) {
    return res.status(400).json({ error: 'Duration must be between 5 and 480 minutes' });
  }
  try {
    const result = await db.query(
      'INSERT INTO services (business_id, name, duration, price) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.user.id, name.trim(), parseInt(duration), parseFloat(price) || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/services/:id
router.put('/:id', auth, async (req, res) => {
  const { name, duration, price, is_active } = req.body;
  try {
    const result = await db.query(
      `UPDATE services
       SET name=COALESCE($1,name), duration=COALESCE($2,duration),
           price=COALESCE($3,price), is_active=COALESCE($4,is_active)
       WHERE id=$5 AND business_id=$6
       RETURNING *`,
      [name, duration ? parseInt(duration) : null, price !== undefined ? parseFloat(price) : null,
       is_active, req.params.id, req.user.id]
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
      'SELECT * FROM services WHERE business_id=$1 AND is_active=true ORDER BY created_at',
      [businessResult.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
