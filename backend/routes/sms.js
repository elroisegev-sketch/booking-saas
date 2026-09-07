const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { normalizePhone } = require('../lib/phone');
const { sendSms, isSmsConfigured, isSmsEnabled } = require('../lib/smsService');
const { isSmsWorkerRunning } = require('../lib/smsWorker');

const router = express.Router();

const testLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'יותר מדי ניסיונות בדיקה. נסי שוב בעוד רבע שעה.' },
});

router.get('/status', auth, (req, res) => {
  res.json({
    configured: isSmsConfigured(),
    provider: 'sms4free',
    smsEnabled: isSmsEnabled(),
    workerRunning: isSmsWorkerRunning(),
  });
});

router.post('/test', auth, testLimiter, async (req, res) => {
  try {
    if (!isSmsConfigured()) {
      return res.status(503).json({
        error: 'חסרים פרטי SMS4FREE. יש להגדיר SMS4FREE_API_KEY, SMS4FREE_USER, SMS4FREE_PASS, SMS4FREE_SENDER',
      });
    }

    const { phone, message } = req.body || {};
    const parsed = normalizePhone(phone);
    if (!parsed.valid) {
      return res.status(400).json({ error: 'מספר טלפון לא תקין' });
    }
    const text = typeof message === 'string' ? message.trim() : '';
    if (!text) {
      return res.status(400).json({ error: 'יש להזין הודעה' });
    }

    const result = await sendSms(parsed.normalized, text);
    return res.status(result.ok ? 200 : 502).json({
      ok: result.ok,
      recipient: result.recipient,
      providerStatus: result.providerStatus,
      providerMessage: result.providerMessage,
    });
  } catch (err) {
    console.error('test sms error:', err && err.message ? err.message : 'unknown_error');
    return res.status(500).json({ error: 'שליחת SMS נכשלה' });
  }
});

module.exports = router;
