const PHONE_RE = /^0[2-9]\d{7,8}$/;

function normalizePhone(raw) {
  if (raw == null) {
    return { raw, digits: '', normalized: null, valid: false };
  }
  const original = String(raw);
  const trimmed = original.trim();
  if (!trimmed) {
    return { raw: original, digits: '', normalized: null, valid: false };
  }
  const digits = trimmed.replace(/\D/g, '').replace(/^972/, '0');
  if (!digits) {
    return { raw: original, digits: '', normalized: null, valid: false };
  }
  const valid = PHONE_RE.test(digits);
  return {
    raw: original,
    digits,
    normalized: valid ? digits : null,
    valid,
  };
}

module.exports = { PHONE_RE, normalizePhone };
