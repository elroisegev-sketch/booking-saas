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
  console.log('✅ Push subscription saved');
  res.json({ ok: true });
});

router.post('/notify', async (req, res) => {
  if (!subscription) return res.json({ ok: false, reason: 'no subscription' });
  try {
    await webpush.sendNotification(subscription, JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (err) {
    console.error('Push error:', err.statusCode, err.body);
    subscription = null;
    res.json({ ok: false });
  }
});

const sendPush = async (payload) => {
  if (!subscription) return;
  try {
    await webpush.sendNotification(subscri
cat > ~/Downloads/booking-saas/backend/server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/availability', require('./routes/availability'));
app.use('/api/push', require('./routes/push').router);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'BookSlot API' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🗓  BookSlot API running on http://localhost:${PORT}`));
