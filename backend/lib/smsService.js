const { normalizePhone } = require('./phone');
const { httpsRequestJson } = require('./httpJson');

const SEND_URL = 'https://api.sms4free.co.il/ApiSMS/v2/SendSMS';
const MAX_MESSAGE_LENGTH = 1000;

const PROVIDER_ERROR_CODES = {
  0: 'SMS_PROVIDER_GENERAL_ERROR',
  [-1]: 'SMS_INVALID_CREDENTIALS',
  [-2]: 'SMS_INVALID_SENDER',
  [-3]: 'SMS_NO_RECIPIENTS',
  [-4]: 'SMS_INSUFFICIENT_BALANCE',
  [-5]: 'SMS_INVALID_MESSAGE_CONTENT',
  [-6]: 'SMS_SENDER_VERIFICATION_REQUIRED',
};

function interpretProviderStatus(status) {
  const n = Number(status);
  if (!Number.isFinite(n)) {
    return { ok: false, code: 'SMS_PROVIDER_REJECTED', recipientsSent: null };
  }
  if (n > 0) {
    return { ok: true, code: 'SMS_SENT', recipientsSent: n };
  }
  return {
    ok: false,
    code: PROVIDER_ERROR_CODES[n] || 'SMS_PROVIDER_REJECTED',
    recipientsSent: null,
  };
}

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
    const interpreted = interpretProviderStatus(rawBody.status);
    const ok = result.statusCode >= 200 && result.statusCode < 300 && interpreted.ok;
    if (!ok) {
      console.error('SMS provider rejected send', {
        httpStatus: result.statusCode,
        providerStatus: rawBody.status == null ? null : rawBody.status,
        code: interpreted.code,
      });
    }
    return {
      ok,
      code: ok ? interpreted.code : (interpreted.ok ? 'SMS_PROVIDER_REJECTED' : interpreted.code),
      recipient,
      providerStatus: rawBody.status == null ? null : rawBody.status,
      providerMessage: response && response.message,
      recipientsSent: interpreted.recipientsSent,
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
  interpretProviderStatus,
  isSmsEnabled,
  isSmsConfigured,
  getSmsCredentials,
  toRecipient,
  sendSms,
};
