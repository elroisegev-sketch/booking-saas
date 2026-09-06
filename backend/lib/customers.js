const { normalizePhone } = require('./phone');

const SOURCE_VALUES = ['instagram', 'facebook_ads', 'google', 'referral', 'organic', 'other'];
const PREFERENCE_KEYS = ['nail_style', 'nail_shape', 'favorite_colors', 'remember'];
const NICKNAME_RE = /^(אמוש|האחות המועדפת|אחותך המועדפת|halel d)$/i;

function cleanName(name) {
  return String(name || '').replace(/\s+/g, ' ').trim();
}

function scoreName(name, { cancelledOnly, frequency }) {
  const n = cleanName(name);
  if (!n) return -Infinity;
  let score = 0;
  if (!cancelledOnly) score += 100;
  const tokens = n.split(' ').filter(Boolean);
  score += tokens.length >= 2 ? 50 : 10;
  if (NICKNAME_RE.test(n)) score -= 80;
  if (/[\u0590-\u05FF]/.test(n)) score += 15;
  if (/בדיקה|CLAUDE/i.test(n)) score -= 30;
  score += Math.min(frequency || 0, 5) * 3;
  score += Math.min(n.length, 24) * 0.4;
  return score;
}

function pickCanonicalName(appointments) {
  const byName = new Map();
  for (const appt of appointments || []) {
    const name = cleanName(appt.customer_name);
    if (!name) continue;
    if (!byName.has(name)) byName.set(name, { name, cancelledOnly: true, frequency: 0 });
    const rec = byName.get(name);
    rec.frequency += 1;
    if (appt.status !== 'cancelled') rec.cancelledOnly = false;
  }
  let best = null;
  let bestScore = -Infinity;
  for (const rec of byName.values()) {
    const score = scoreName(rec.name, rec);
    if (score > bestScore) {
      bestScore = score;
      best = rec.name;
    }
  }
  return best || 'לקוחה';
}

function resolveReturnDays({ recommended_return_days_min, recommended_return_days_max, last_service, last_category } = {}) {
  if (recommended_return_days_min != null && recommended_return_days_min !== '') {
    const min = parseInt(recommended_return_days_min, 10);
    const maxRaw = recommended_return_days_max != null && recommended_return_days_max !== ''
      ? parseInt(recommended_return_days_max, 10)
      : min + 7;
    return { min, max: maxRaw };
  }
  const text = `${last_service || ''} ${last_category || ''}`;
  if (/הרמת ריסים/.test(text)) return { min: 42, max: 56 };
  if (/הרמת גבות/.test(text)) return { min: 42, max: 56 };
  if (/עיצוב גבות/.test(text)) return { min: 21, max: 28 };
  return { min: 21, max: 28 };
}

function daysBetween(from, to = new Date()) {
  if (!from) return null;
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

function computeCustomerFlags(row) {
  const visitCount = parseInt(row.visit_count, 10) || 0;
  const lastVisit = row.last_visit || null;
  const nextAppointment = row.next_appointment || null;
  const returnDays = resolveReturnDays(row);
  const daysSince = daysBetween(lastVisit);
  const hasNext = !!nextAppointment;
  const inactive = !hasNext && daysSince != null && daysSince > 90;
  const rebook_due = !hasNext && !!lastVisit && daysSince != null && daysSince >= returnDays.min;
  let status = 'new';
  if (visitCount >= 3) status = 'regular';
  else if (visitCount === 2) status = 'returning';
  return {
    status,
    inactive,
    rebook_due,
    days_since_last: daysSince,
    return_days: returnDays,
  };
}

function displayStatus(flags) {
  if (flags.inactive) return 'inactive';
  if (flags.rebook_due) return 'rebook_due';
  return flags.status;
}

function sanitizePreferences(raw) {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const key of PREFERENCE_KEYS) {
    if (src[key] == null) continue;
    out[key] = String(src[key]).slice(0, 500);
  }
  return out;
}

function sanitizeSource(value) {
  if (!value) return null;
  const v = String(value).trim();
  return SOURCE_VALUES.includes(v) ? v : null;
}

async function findOrCreateCustomer(db, businessId, { name, phone, email } = {}, { updateName = false } = {}) {
  const parsed = normalizePhone(phone);
  if (!parsed.valid) return null;

  const existing = await db.query(
    'SELECT * FROM customers WHERE business_id=$1 AND phone_normalized=$2',
    [businessId, parsed.normalized]
  );
  if (existing.rows[0]) {
    const row = existing.rows[0];
    const sets = [];
    const params = [];
    const nextName = cleanName(name);
    if (updateName && nextName && nextName !== row.name) {
      params.push(nextName);
      sets.push(`name=$${params.length}`);
    }
    const nextEmail = email ? String(email).trim() : '';
    if (nextEmail && !row.email) {
      params.push(nextEmail);
      sets.push(`email=$${params.length}`);
    }
    if (!sets.length) return row;
    params.push(row.id, businessId);
    const updated = await db.query(
      `UPDATE customers SET ${sets.join(', ')}, updated_at=NOW()
       WHERE id=$${params.length - 1} AND business_id=$${params.length}
       RETURNING *`,
      params
    );
    return updated.rows[0] || row;
  }

  try {
    const inserted = await db.query(
      `INSERT INTO customers (business_id, name, phone, phone_normalized, email)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [businessId, cleanName(name) || 'לקוחה', parsed.normalized, parsed.normalized, email ? String(email).trim() : null]
    );
    return inserted.rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const again = await db.query(
        'SELECT * FROM customers WHERE business_id=$1 AND phone_normalized=$2',
        [businessId, parsed.normalized]
      );
      return again.rows[0] || null;
    }
    throw err;
  }
}

module.exports = {
  SOURCE_VALUES,
  PREFERENCE_KEYS,
  scoreName,
  pickCanonicalName,
  resolveReturnDays,
  computeCustomerFlags,
  displayStatus,
  sanitizePreferences,
  sanitizeSource,
  findOrCreateCustomer,
  cleanName,
};
