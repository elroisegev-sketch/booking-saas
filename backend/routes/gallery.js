const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

const MAX_IMAGES = 40;
const MAX_BYTES = 1_800_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const m = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
  if (!m) return null;
  const mime = m[1] === 'image/jpg' ? 'image/jpeg' : m[1];
  const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
  if (!buf.length || buf.length > MAX_BYTES) return null;
  return { mime, buf };
}

function publicUrl(id) {
  const base = process.env.PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app';
  return `${base}/api/gallery/file/${id}`;
}

// GET /api/gallery/public/:slug
router.get('/public/:slug', async (req, res) => {
  try {
    const biz = await db.query('SELECT id FROM users WHERE slug=$1', [req.params.slug]);
    if (!biz.rows.length) return res.status(404).json({ error: 'Business not found' });
    const result = await db.query(
      'SELECT id, sort_order FROM gallery_images WHERE business_id=$1 ORDER BY sort_order ASC, created_at ASC',
      [biz.rows[0].id]
    );
    res.json(result.rows.map((r) => ({ id: r.id, url: publicUrl(r.id), sort_order: r.sort_order })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gallery/file/:id
router.get('/file/:id', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const result = await db.query('SELECT mime, data FROM gallery_images WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    const row = result.rows[0];
    res.set('Content-Type', row.mime || 'image/jpeg');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.send(row.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gallery
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, sort_order, created_at FROM gallery_images WHERE business_id=$1 ORDER BY sort_order ASC, created_at ASC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({ id: r.id, url: publicUrl(r.id), sort_order: r.sort_order })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gallery
router.post('/', auth, async (req, res) => {
  const parsed = parseDataUrl(req.body && req.body.image);
  if (!parsed) return res.status(400).json({ error: 'צריך תמונת JPEG או PNG' });
  try {
    const count = await db.query('SELECT COUNT(*)::int AS n FROM gallery_images WHERE business_id=$1', [req.user.id]);
    if (count.rows[0].n >= MAX_IMAGES) return res.status(400).json({ error: `אפשר עד ${MAX_IMAGES} תמונות` });
    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM gallery_images WHERE business_id=$1',
      [req.user.id]
    );
    const result = await db.query(
      'INSERT INTO gallery_images (business_id, sort_order, mime, data) VALUES ($1,$2,$3,$4) RETURNING id, sort_order',
      [req.user.id, maxOrder.rows[0].next, parsed.mime, parsed.buf]
    );
    const row = result.rows[0];
    res.status(201).json({ id: row.id, url: publicUrl(row.id), sort_order: row.sort_order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/gallery/reorder
router.put('/reorder', auth, async (req, res) => {
  const ids = req.body && req.body.ids;
  if (!Array.isArray(ids) || !ids.every((id) => UUID_RE.test(id))) {
    return res.status(400).json({ error: 'Invalid ids' });
  }
  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          'UPDATE gallery_images SET sort_order=$1 WHERE id=$2 AND business_id=$3',
          [i, ids[i], req.user.id]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', auth, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    await db.query('DELETE FROM gallery_images WHERE id=$1 AND business_id=$2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
