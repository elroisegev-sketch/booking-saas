const { normalizePhone } = require('./phone');
const { httpsRequestJson } = require('./httpJson');

const SEND_URL = 'https://api.sms4free.co.il/ApiSMS/v2/SendSMS';
const MAX_MESSAGE_LENGTH = 1000;

function isSmsEnabled() {
  return String(process.env.SMS_ENABLED || '').toLowerCase() === 'true';
}

function readCredentials() {
  const key = (process.env.SMS4FREE_API_KEY || process.env.SMS4FREE_KEY || '').trim();
  const user = (process.env.SMS4FREE_USER || '').trim();
  const pass = (process.env.SMS4FREE_PASS || '').trim();
  const sender = (process.env.SMS4FREE_SENDER || '').trim();
  return { key, user, pass, sender };
}

function isSmsConfigured() {
  const { key, user, pass, sender } = readCredentials();
  return Boolean(key && user && pass && sender);
}

function getSmsCredentials() {
  return { configured: isSmsConfigured() };
}

function toRecipient(phone) {
  const parsed = normalizePhone(phone);
  return parsed.valid ? parsed.normalized : null;
}

function sanitizeProviderResponse(body) {
  if (!body || typeof body !== 'object') return body == null ? null : { raw: String(body).slice(0, 300) };
  const { status, message } = body;
  return {
    status: status == null ? null : status,
    message: message == null ? null : String(message).slice(0, 300),
  };
}

async function sendSms(phone, message, options) {
  try {
    if (phone && typeof phone === 'object' && !Array.isArray(phone)) {
      return sendSms(phone.phone, phone.message, { requestJson: phone.requestJson });
    }

    const msg = String(message || '').trim();
    if (!msg) {
      return { ok: false, code: 'SMS_INVALID_MESSAGE', error: 'empty_message' };
    }
    if (msg.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, code: 'SMS_INVALID_MESSAGE', error: 'message_too_long' };
    }

    if (!isSmsConfigured()) {
      return { ok: false, code: 'SMS_CREDENTIALS_MISSING', error: 'sms_credentials_missing' };
    }

    const recipient = toRecipient(phone);
    if (!recipient) {
      return { ok: false, code: 'SMS_INVALID_RECIPIENT', error: 'sms_invalid_recipient' };
    }

    const credentials = readCredentials();
    const requestJson = (options && options.requestJson) || httpsRequestJson;
    const result = await requestJson({
      method: 'POST',
      url: SEND_URL,
      timeoutMs: 10000,
      headers: { 'Content-Type': 'application/json' },
      body: {
        key: credentials.key,
        user: credentials.user,
        pass: credentials.pass,
        sender: credentials.sender.slice(0, 11),
        recipient,
        msg,
      },
    });

    const rawBody = result.body && typeof result.body === 'object' ? result.body : { raw: result.raw };
    const response = sanitizeProviderResponse(rawBody);
    const ok = result.statusCode >= 200 && result.statusCode < 300 && Number(rawBody.status) === 0;
    if (!ok) {
      console.error('SMS provider rejected send', {
        httpStatus: result.statusCode,
        providerStatus: rawBody.status == null ? null : rawBody.status,
      });
    }
    return {
      ok,
      code: ok ? 'SMS_SENT' : 'SMS_PROVIDER_REJECTED',
      recipient,
      providerStatus: rawBody.status == null ? null : rawBody.status,
      providerMessage: response && response.message,
      response,
    };
  } catch (err) {
    console.error('SMS send failed:', err && err.code ? err.code : 'network_or_provider_error');
    return { ok: false, code: 'SMS_SEND_FAILED', error: 'send_failed' };
  }
}

module.exports = {
  SEND_URL,
  MAX_MESSAGE_LENGTH,
  isSmsEnabled,
  isSmsConfigured,
  getSmsCredentials,
  toRecipient,
  sendSms,
};
