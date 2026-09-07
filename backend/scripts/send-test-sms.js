require('dotenv').config();
const { normalizePhone } = require('../lib/phone');
const { sendSms, isSmsConfigured } = require('../lib/smsService');

function arg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || true;
}

async function main() {
  const phoneArg = arg('phone');
  const messageArg = arg('message');
  const confirm = process.argv.includes('--confirm');

  if (!phoneArg || phoneArg === true) {
    console.log(`
שימוש:
  node scripts/send-test-sms.js --phone 0535249688 --message "הודעת בדיקה"
  הוסיפי --confirm כדי לשלוח באמת דרך SMS4FREE.

בלי --confirm רק מדפיסים את ההודעה. לא נשלח כלום.
`);
    process.exit(1);
  }

  const parsed = normalizePhone(phoneArg);
  if (!parsed.valid) {
    console.error('Invalid phone');
    process.exit(1);
  }

  const message = typeof messageArg === 'string' && messageArg.trim()
    ? messageArg.trim()
    : 'זו הודעת בדיקה ממערכת התזכורות של ליאור.';

  console.log('configured:', isSmsConfigured());
  console.log('recipient:', parsed.normalized);
  console.log('--- message ---');
  console.log(message);
  console.log('---------------');

  if (!confirm) {
    console.log('לא נשלח. הוסיפי --confirm כדי לשלוח SMS אמיתי.');
    process.exit(0);
  }
  if (!isSmsConfigured()) {
    console.error('Missing SMS4FREE_API_KEY / SMS4FREE_USER / SMS4FREE_PASS / SMS4FREE_SENDER');
    process.exit(1);
  }

  const result = await sendSms(parsed.normalized, message);
  console.log('ok:', result.ok);
  console.log('providerStatus:', result.providerStatus);
  console.log('providerMessage:', result.providerMessage);
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
