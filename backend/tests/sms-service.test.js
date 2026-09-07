const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { sendSms, toRecipient, isSmsConfigured } = require('../lib/smsService');

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
        return { statusCode: 200, body: { status: 0, message: 'ok' } };
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
});
