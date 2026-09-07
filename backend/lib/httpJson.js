const https = require('https');
const { URL } = require('url');

function httpsRequestJson({ method = 'GET', url, body, headers = {}, timeoutMs = 8000 }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const payload = body === undefined || body === null ? null : JSON.stringify(body);
    const req = https.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: `${parsed.pathname}${parsed.search}`,
      method,
      headers: {
        Accept: 'application/json',
        'User-Agent': headers['User-Agent'] || 'BookSlot/1.0 (lioryourbeauty.com; sms-reminders)',
        ...headers,
        ...(payload ? {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        } : {}),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsedBody = data;
        try { parsedBody = data ? JSON.parse(data) : null; } catch { /* keep raw string */ }
        resolve({ statusCode: res.statusCode, body: parsedBody, raw: data });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = { httpsRequestJson };
