const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { sendSms, toRecipient, isSmsConfigured, interpretProviderStatus } = require('../lib/smsService');

const ENV_KEYS = ['SMS4FREE_API_KEY', 'SMS4FREE_KEY', 'SMS4FREE_USER', 'SMS4FREE_PASS', 'SMS4FREE_SENDER'];
const originalEnv = {};

function setTestEnv() {
  process.env.SMS4FREE_API_KEY = 'test-api-key';
  process.env.SMS4FREE_USER = '0500000000';
  process.env.SMS4FREE_PASS = 'test-pass';
  process.env.SMS4FREE_SENDER = '0500000000';
}

describe('smsService', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  it('normalizes an Israeli mobile number', () => {
    assert.equal(toRecipient('053-524-9688'), '0535249688');
    assert.equal(toRecipient('+972535249688'), '0535249688');
    assert.equal(toRecipient('not-a-phone'), null);
  });

  it('does not throw when credentials are missing', async () => {
    const result = await sendSms('053-524-9688', 'בדיקה');
    assert.equal(result.ok, false);
    assert.equal(result.code, 'SMS_CREDENTIALS_MISSING');
    assert.equal(isSmsConfigured(), false);
    assert.equal(JSON.stringify(result).includes('test-pass'), false);
  });

  it('rejects an invalid phone without calling the provider', async () => {
    setTestEnv();
    let called = false;
    const result = await sendSms('123', 'בדיקה', {
      requestJson: async () => {
        called = true;
        return { statusCode: 200, body: { status: 0, message: 'ok' } };
      },
    });
    assert.equal(called, false);
    assert.equal(result.ok, false);
    assert.equal(result.code, 'SMS_INVALID_RECIPIENT');
  });

  it('posts JSON to SMS4FREE with the API key env var and never returns secrets', async () => {
    setTestEnv();
    let captured;
    const result = await sendSms('053-524-9688', 'היי זו בדיקה', {
      requestJson: async (req) => {
        captured = req;
        return { statusCode: 200, body: { status: 1, message: 'ok' } };
      },
    });
    assert.equal(result.ok, true);
    assert.equal(captured.method, 'POST');
    assert.equal(captured.url, 'https://api.sms4free.co.il/ApiSMS/v2/SendSMS');
    assert.equal(captured.headers['Content-Type'], 'application/json');
    assert.equal(captured.body.key, 'test-api-key');
    assert.equal(captured.body.recipient, '0535249688');
    assert.equal(captured.body.msg, 'היי זו בדיקה');
    assert.equal(captured.body.sender, '0500000000');
    const dumped = JSON.stringify(result);
    assert.equal(dumped.includes('test-api-key'), false);
    assert.equal(dumped.includes('test-pass'), false);
  });

  it('does not throw when the provider request fails', async () => {
    setTestEnv();
    const result = await sendSms('0535249688', 'בדיקה', {
      requestJson: async () => {
        throw new Error('socket hang up key=should-not-leak');
      },
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'SMS_SEND_FAILED');
    assert.equal(result.error, 'send_failed');
    assert.equal(JSON.stringify(result).includes('should-not-leak'), false);
  });

  it('treats provider status > 0 as success even if the message text is not Succeeded', async () => {
    setTestEnv();
    const result = await sendSms('0545305083', 'בדיקה', {
      requestJson: async () => ({ statusCode: 200, body: { status: 1, message: 'error-looking-text' } }),
    });
    assert.equal(result.ok, true);
    assert.equal(result.code, 'SMS_SENT');
    assert.equal(result.providerStatus, 1);
    assert.equal(result.providerMessage, 'error-looking-text');
    assert.equal(result.recipientsSent, 1);
  });

  it('treats provider status 0 as failure even if the message says Succeeded', async () => {
    setTestEnv();
    const result = await sendSms('0545305083', 'בדיקה', {
      requestJson: async () => ({ statusCode: 200, body: { status: 0, message: 'Succeeded' } }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'SMS_PROVIDER_GENERAL_ERROR');
    assert.equal(result.providerStatus, 0);
    assert.equal(result.providerMessage, 'Succeeded');
  });
});

describe('SMS4FREE provider status codes', () => {
  beforeEach(() => {
    for (const key of ENV_KEYS) {
      originalEnv[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  it('maps official SendSMS v2 codes from status, not message text', () => {
    assert.deepEqual(interpretProviderStatus(1), { ok: true, code: 'SMS_SENT', recipientsSent: 1 });
    assert.deepEqual(interpretProviderStatus(3), { ok: true, code: 'SMS_SENT', recipientsSent: 3 });
    assert.deepEqual(interpretProviderStatus(0), { ok: false, code: 'SMS_PROVIDER_GENERAL_ERROR', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-1), { ok: false, code: 'SMS_INVALID_CREDENTIALS', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-2), { ok: false, code: 'SMS_INVALID_SENDER', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-3), { ok: false, code: 'SMS_NO_RECIPIENTS', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-4), { ok: false, code: 'SMS_INSUFFICIENT_BALANCE', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-5), { ok: false, code: 'SMS_INVALID_MESSAGE_CONTENT', recipientsSent: null });
    assert.deepEqual(interpretProviderStatus(-6), { ok: false, code: 'SMS_SENDER_VERIFICATION_REQUIRED', recipientsSent: null });
    assert.equal(interpretProviderStatus(-2).ok, false);
    assert.notEqual(interpretProviderStatus(0).ok, interpretProviderStatus(1).ok);
  });

  it('keeps providerStatus and providerMessage on sendSms for every official code', async () => {
    setTestEnv();
    const cases = [
      { status: 2, ok: true, code: 'SMS_SENT' },
      { status: 0, ok: false, code: 'SMS_PROVIDER_GENERAL_ERROR' },
      { status: -1, ok: false, code: 'SMS_INVALID_CREDENTIALS' },
      { status: -2, ok: false, code: 'SMS_INVALID_SENDER' },
      { status: -3, ok: false, code: 'SMS_NO_RECIPIENTS' },
      { status: -4, ok: false, code: 'SMS_INSUFFICIENT_BALANCE' },
      { status: -5, ok: false, code: 'SMS_INVALID_MESSAGE_CONTENT' },
      { status: -6, ok: false, code: 'SMS_SENDER_VERIFICATION_REQUIRED' },
    ];
    for (const item of cases) {
      const result = await sendSms('0545305083', 'בדיקה', {
        requestJson: async () => ({ statusCode: 200, body: { status: item.status, message: 'Succeeded' } }),
      });
      assert.equal(result.ok, item.ok, `status ${item.status} ok`);
      assert.equal(result.code, item.code, `status ${item.status} code`);
      assert.equal(result.providerStatus, item.status);
      assert.equal(result.providerMessage, 'Succeeded');
    }
  });
});
