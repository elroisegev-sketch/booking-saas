const express = require('express');
const webpush = require('web-push');
const router = express.Router();

webpush.setVapidDetails(
  'mailto:lior@beauty.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscription = null;

router.post('/subscribe', (req, res) => {
  subscription = req.body;
  console.log('Push subscription saved');
  res.json({ ok: true });
});

router.post('/notify', async (req, res) => {
  if (!subscription) return res.json({ ok: false });
  try {
    await webpush.sendNotification(subscription, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (err) {
    subscription = null;
    res.json({ ok: false });
  }
});

const sendPush = async (payload) => {
  if (!subscription) return;
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch(e) {
    subscription = null;
  }
};

module.exports = { router, sendPush };
