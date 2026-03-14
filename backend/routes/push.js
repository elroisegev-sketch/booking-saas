const express = require('express');
const router = express.Router();
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

let subscription = null;

router.post('/subscribe', (req, res) => {
  subscription = req.body;
  console.log('✅ Push subscription saved');
  res.json({ ok: true });
});

router.post('/notify', async (req, res) => {
  if (!webpush || !subscription) return res.json({ ok: false });
  try {
    await webpush.sendNotification(subscription, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (err) {
    subscription = null;
    res.json({ ok: false });
  }
});

const sendPush = async (payload) => {
  if (!webpush || !subscription) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch(e) {
    subscription = null;
  }
};

module.exports = { router, sendPush };
