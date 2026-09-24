const express = require('express');
const db = require('../db');
const { getPublicReviews, toPublicPayload, FALLBACK } = require('../lib/googleReviews');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const data = await getPublicReviews(db);
    res.set('Cache-Control', 'public, max-age=600');
    res.json(toPublicPayload(data));
  } catch (err) {
    console.error('public reviews:', err.message);
    res.json(toPublicPayload(FALLBACK));
  }
});

module.exports = router;
