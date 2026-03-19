const express = require('express');
const router = express.Router();
const db = require('../db');
let webpush = null;

try {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush = require('web-push');
    webpush.setVapidDetails(
      'mailto:lior@beauty.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    console.log('✅ Push notifications enabled');
  } else {
    console.log('⚠️  Push notifications disabled (no VAPID keys)');
  }
} catch(e) {
  console.error('Push init error:', e.message);
}

router.post('/subscribe', async (req, res) => {
  const { business_id, subscription } = req.body;
  if (!business_id || !subscription) return res.status(400).json({ error: 'Missing fields' });
  try {
    await db.query(
      `INSERT INTO push_subscriptions (business_id, subscription)
       VALUES ($1, $2)
       ON CONFLICT (business_id, endpoint) DO UPDATE SET subscription = $2`,
      [business_id, JSON.stringify(subscription)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ ok: false });
  }
});

router.post('/notify', async (req, res) => {
  if (!webpush) return res.json({ ok: false });
  const { business_id, payload } = req.body;
  if (!business_id) return res.status(400).json({ error: 'Missing business_id' });
  try {
    const result = await db.query(
      'SELECT subscription FROM push_subscriptions WHERE business_id=$1',
      [business_id]
    );
    for (const row of result.rows) {
      const sub = JSON.parse(row.subscription);
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410) {
          // Subscription expired — remove it
          await db.query(
            'DELETE FROM push_subscriptions WHERE business_id=$1 AND endpoint=$2',
            [business_id, sub.endpoint]
          );
        }
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

const sendPush = async (business_id, payload) => {
  if (!webpush) return;
  try {
    const result = await db.query(
      'SELECT subscription FROM push_subscriptions WHERE business_id=$1',
      [business_id]
    );
    for (const row of result.rows) {
      const sub = JSON.parse(row.subscription);
      try {
        await webpush.sendNotification(sub, JSON.stringify(payload));
      } catch (err) {
        if (err.statusCode === 410) {
          await db.query(
            'DELETE FROM push_subscriptions WHERE business_id=$1 AND endpoint=$2',
            [business_id, sub.endpoint]
          );
        }
      }
    }
  } catch(e) {
    console.error('sendPush error:', e.message);
  }
};

module.exports = { router, sendPush };
