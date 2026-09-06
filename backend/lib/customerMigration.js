const fs = require('fs');
const path = require('path');
const { normalizePhone } = require('./phone');
const { pickCanonicalName } = require('./customers');

const MIGRATION_SQL = fs.readFileSync(
  path.join(__dirname, '../db/migrations/001_customers.sql'),
  'utf8'
);

async function applyCustomerSchema(db) {
  const statements = MIGRATION_SQL
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter(Boolean);
  for (const statement of statements) {
    await db.query(statement);
  }
}

function nameConflictKind(names) {
  const unique = [...new Set(names.map((n) => String(n || '').replace(/\s+/g, ' ').trim()).filter(Boolean))];
  if (unique.length <= 1) return null;
  const nick = /^(אמוש|האחות המועדפת|אחותך המועדפת|halel d)$/i;
  const hasNick = unique.some((n) => nick.test(n));
  const tokens = unique.map((n) => n.split(' ')[0]);
  const sameFirst = tokens.every((t) => t === tokens[0]);
  if (hasNick && sameFirst) return 'nickname';
  if (sameFirst) return 'spelling_or_extra_name';
  const substring = unique.some((a) => unique.some((b) => a !== b && (a.includes(b) || b.includes(a))));
  if (substring) return 'short_vs_full';
  return 'different_names';
}

async function backfillCustomers(db) {
  const before = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM appointments) AS appointments,
      (SELECT COUNT(*)::int FROM services) AS services,
      (SELECT COUNT(*)::int FROM users) AS users
  `);

  const appts = await db.query(`
    SELECT id, business_id, customer_name, customer_phone, customer_email, status, appointment_time, customer_id
    FROM appointments
    ORDER BY appointment_time ASC
  `);

  const groups = new Map();
  const invalid = [];
  for (const row of appts.rows) {
    const parsed = normalizePhone(row.customer_phone);
    if (!parsed.valid) {
      invalid.push({ id: row.id, name: row.customer_name, status: row.status });
      continue;
    }
    const key = `${row.business_id}::${parsed.normalized}`;
    if (!groups.has(key)) {
      groups.set(key, {
        business_id: row.business_id,
        phone_normalized: parsed.normalized,
        appointments: [],
      });
    }
    groups.get(key).appointments.push(row);
  }

  const nameConflicts = [];
  let created = 0;
  let reused = 0;
  let linked = 0;

  for (const group of groups.values()) {
    const names = group.appointments.map((a) => a.customer_name);
    const kind = nameConflictKind(names);
    const canonical = pickCanonicalName(group.appointments);
    if (kind) {
      nameConflicts.push({
        phone: `${group.phone_normalized.slice(0, 3)}*****${group.phone_normalized.slice(-3)}`,
        names: [...new Set(names.map((n) => String(n).replace(/\s+/g, ' ').trim()))],
        chosen: canonical,
        kind,
      });
    }

    const existing = await db.query(
      'SELECT id FROM customers WHERE business_id=$1 AND phone_normalized=$2',
      [group.business_id, group.phone_normalized]
    );

    let customerId;
    if (existing.rows[0]) {
      customerId = existing.rows[0].id;
      reused += 1;
    } else {
      const latest = group.appointments[group.appointments.length - 1];
      const email = group.appointments.map((a) => (a.customer_email || '').trim()).find(Boolean) || null;
      const inserted = await db.query(
        `INSERT INTO customers (business_id, name, phone, phone_normalized, email)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [group.business_id, canonical, group.phone_normalized, group.phone_normalized, email]
      );
      customerId = inserted.rows[0].id;
      created += 1;
    }

    const ids = group.appointments.filter((a) => !a.customer_id).map((a) => a.id);
    if (ids.length) {
      const updated = await db.query(
        `UPDATE appointments SET customer_id=$1
         WHERE id = ANY($2::uuid[]) AND customer_id IS NULL
         RETURNING id`,
        [customerId, ids]
      );
      linked += updated.rowCount;
    }
  }

  const after = await db.query(`
    SELECT
      (SELECT COUNT(*)::int FROM appointments) AS appointments,
      (SELECT COUNT(*)::int FROM services) AS services,
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM customers) AS customers,
      (SELECT COUNT(*)::int FROM appointments WHERE customer_id IS NOT NULL) AS linked,
      (SELECT COUNT(*)::int FROM appointments WHERE customer_id IS NULL) AS unlinked,
      (SELECT COUNT(*)::int FROM appointments a
        LEFT JOIN customers c ON c.id = a.customer_id
        WHERE a.customer_id IS NOT NULL AND c.id IS NULL) AS orphans,
      (SELECT COUNT(*)::int FROM (
        SELECT business_id, phone_normalized FROM customers
        WHERE phone_normalized IS NOT NULL
        GROUP BY business_id, phone_normalized
        HAVING COUNT(*) > 1
      ) d) AS duplicate_phones
  `);

  return {
    before: before.rows[0],
    after: after.rows[0],
    customers_created: created,
    customers_reused: reused,
    appointments_linked: linked,
    invalid_phones: invalid.length,
    name_conflicts: nameConflicts,
  };
}

module.exports = { applyCustomerSchema, backfillCustomers };
