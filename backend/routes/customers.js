const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { normalizePhone } = require('../lib/phone');
const {
  computeCustomerFlags,
  displayStatus,
  sanitizePreferences,
  sanitizeSource,
  cleanName,
} = require('../lib/customers');

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FILTERS = new Set(['all', 'new', 'returning', 'regular', 'rebook_due', 'inactive', 'vip']);

function isUuid(id) {
  return UUID_RE.test(String(id || ''));
}

function decorate(row) {
  const flags = computeCustomerFlags(row);
  const status = displayStatus(flags);
  return {
    id: row.id,
    business_id: row.business_id,
    name: row.name,
    phone: row.phone,
    phone_normalized: row.phone_normalized,
    email: row.email,
    birthday: row.birthday,
    source: row.source,
    source_detail: row.source_detail,
    notes: row.notes,
    preferences: row.preferences || {},
    is_vip: !!row.is_vip,
    created_at: row.created_at,
    updated_at: row.updated_at,
    visit_count: parseInt(row.visit_count, 10) || 0,
    lifetime_value: parseFloat(row.lifetime_value || 0),
    last_visit: row.last_visit,
    last_service: row.last_service || null,
    next_appointment: row.next_appointment,
    next_service: row.next_service || null,
    status,
    base_status: flags.status,
    rebook_due: flags.rebook_due,
    inactive: flags.inactive,
    days_since_last: flags.days_since_last,
    return_days: flags.return_days,
    phone_valid: !!row.phone_normalized,
  };
}

const LIST_SQL = `
  WITH scoped AS (
    SELECT c.*
    FROM customers c
    WHERE c.business_id = $1
      AND (
        $2::text IS NULL OR btrim($2) = ''
        OR c.name ILIKE '%' || $2 || '%'
        OR COALESCE(c.phone, '') ILIKE '%' || $2 || '%'
        OR COALESCE(c.phone_normalized, '') ILIKE '%' || $2 || '%'
      )
  ),
  metrics AS (
    SELECT
      c.id AS customer_id,
      COUNT(a.id) FILTER (WHERE a.status IS NOT NULL AND a.status <> 'cancelled' AND a.appointment_time <= NOW())::int AS visit_count,
      COALESCE(SUM(COALESCE(a.total_price, s.price, 0)) FILTER (
        WHERE a.status IS NOT NULL AND a.status <> 'cancelled' AND a.appointment_time <= NOW()
      ), 0) AS lifetime_value,
      MAX(a.appointment_time) FILTER (WHERE a.status IS NOT NULL AND a.status <> 'cancelled' AND a.appointment_time <= NOW()) AS last_visit,
      MIN(a.appointment_time) FILTER (WHERE a.status IS NOT NULL AND a.status <> 'cancelled' AND a.appointment_time > NOW()) AS next_appointment,
      COUNT(a.id) FILTER (WHERE a.status IS NOT NULL AND a.status <> 'cancelled')::int AS active_count
    FROM scoped c
    LEFT JOIN appointments a ON a.customer_id = c.id AND a.business_id = c.business_id
    LEFT JOIN services s ON s.id = a.service_id
    GROUP BY c.id
  ),
  last_svc AS (
    SELECT DISTINCT ON (a.customer_id)
      a.customer_id,
      COALESCE(s.name, a.service_names_text, 'טיפול') AS last_service,
      s.recommended_return_days_min,
      s.recommended_return_days_max,
      s.category AS last_category
    FROM appointments a
    LEFT JOIN services s ON s.id = a.service_id
    WHERE a.business_id = $1
      AND a.customer_id IS NOT NULL
      AND a.status <> 'cancelled'
      AND a.appointment_time <= NOW()
    ORDER BY a.customer_id, a.appointment_time DESC
  ),
  next_svc AS (
    SELECT DISTINCT ON (a.customer_id)
      a.customer_id,
      COALESCE(s.name, a.service_names_text, 'טיפול') AS next_service
    FROM appointments a
    LEFT JOIN services s ON s.id = a.service_id
    WHERE a.business_id = $1
      AND a.customer_id IS NOT NULL
      AND a.status <> 'cancelled'
      AND a.appointment_time > NOW()
    ORDER BY a.customer_id, a.appointment_time ASC
  )
  SELECT
    c.*,
    m.visit_count,
    m.lifetime_value,
    m.last_visit,
    m.next_appointment,
    m.active_count,
    ls.last_service,
    ns.next_service,
    ls.recommended_return_days_min,
    ls.recommended_return_days_max,
    ls.last_category
  FROM scoped c
  JOIN metrics m ON m.customer_id = c.id
  LEFT JOIN last_svc ls ON ls.customer_id = c.id
  LEFT JOIN next_svc ns ON ns.customer_id = c.id
  WHERE m.active_count > 0
`;

function matchesFilter(row, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'vip') return !!row.is_vip;
  if (filter === 'rebook_due') return !!row.rebook_due;
  if (filter === 'inactive') return !!row.inactive;
  if (filter === 'new') return row.base_status === 'new';
  if (filter === 'returning') return row.base_status === 'returning';
  if (filter === 'regular') return row.base_status === 'regular';
  return true;
}

router.get('/', auth, async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().replace(/[%_]/g, '').slice(0, 80) : '';
  const filter = typeof req.query.filter === 'string' ? req.query.filter : 'all';
  if (!FILTERS.has(filter)) return res.status(400).json({ error: 'filter לא תקין' });
  try {
    const result = await db.query(LIST_SQL, [req.user.id, q]);
    const rows = result.rows.map(decorate).filter((row) => matchesFilter(row, filter));
    rows.sort((a, b) => {
      if (filter === 'rebook_due') return (b.days_since_last || 0) - (a.days_since_last || 0);
      const aTime = a.next_appointment || a.last_visit || a.created_at;
      const bTime = b.next_appointment || b.last_visit || b.created_at;
      return new Date(bTime) - new Date(aTime);
    });
    res.json(rows);
  } catch (err) {
    console.error('GET /customers', err);
    res.status(500).json({ error: 'שגיאה בטעינת הלקוחות' });
  }
});

router.get('/:id', auth, async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'מזהה לא תקין' });
  try {
    const result = await db.query(`${LIST_SQL} AND c.id = $3`, [req.user.id, '', req.params.id]);
    let row = result.rows[0];
    if (!row) {
      const fallback = await db.query(
        `SELECT c.*, 0 AS visit_count, 0 AS lifetime_value, NULL::timestamptz AS last_visit,
                NULL::timestamptz AS next_appointment, 0 AS active_count,
                NULL AS last_service, NULL AS next_service,
                NULL::int AS recommended_return_days_min, NULL::int AS recommended_return_days_max,
                NULL AS last_category
         FROM customers c
         WHERE c.id=$1 AND c.business_id=$2`,
        [req.params.id, req.user.id]
      );
      if (!fallback.rows[0]) return res.status(404).json({ error: 'לקוחה לא נמצאה' });
      row = fallback.rows[0];
    }
    const history = await db.query(
      `SELECT a.id, a.appointment_time, a.end_time, a.status, a.notes,
              COALESCE(s.name, a.service_names_text, 'טיפול') AS service_name,
              COALESCE(a.total_price, s.price, 0) AS price
       FROM appointments a
       LEFT JOIN services s ON s.id = a.service_id
       WHERE a.business_id=$1 AND a.customer_id=$2
       ORDER BY a.appointment_time DESC`,
      [req.user.id, req.params.id]
    );
    res.json({
      customer: decorate(row),
      history: history.rows,
    });
  } catch (err) {
    console.error('GET /customers/:id', err);
    res.status(500).json({ error: 'שגיאה בטעינת כרטיס הלקוחה' });
  }
});

function parseBirthday(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return undefined;
  return value;
}

router.post('/', auth, async (req, res) => {
  const name = cleanName(req.body.name);
  if (!name || name.length < 2) return res.status(400).json({ error: 'שם לא תקין' });
  const parsed = normalizePhone(req.body.phone);
  if (req.body.phone && String(req.body.phone).trim() && !parsed.valid) {
    return res.status(400).json({ error: 'מספר טלפון לא תקין' });
  }
  const birthday = parseBirthday(req.body.birthday);
  if (birthday === undefined) return res.status(400).json({ error: 'תאריך לידה לא תקין' });
  const source = sanitizeSource(req.body.source);
  try {
    if (parsed.valid) {
      const existing = await db.query(
        'SELECT id FROM customers WHERE business_id=$1 AND phone_normalized=$2',
        [req.user.id, parsed.normalized]
      );
      if (existing.rows[0]) return res.status(409).json({ error: 'מספר הטלפון כבר משויך ללקוחה אחרת' });
    }
    const result = await db.query(
      `INSERT INTO customers
        (business_id, name, phone, phone_normalized, email, birthday, source, source_detail, notes, preferences, is_vip)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
       RETURNING *`,
      [
        req.user.id,
        name,
        parsed.normalized || (req.body.phone ? String(req.body.phone).trim() : null),
        parsed.normalized,
        req.body.email ? String(req.body.email).trim() : null,
        birthday,
        source,
        req.body.source_detail ? String(req.body.source_detail).trim().slice(0, 255) : null,
        req.body.notes ? String(req.body.notes).slice(0, 2000) : null,
        JSON.stringify(sanitizePreferences(req.body.preferences)),
        !!req.body.is_vip,
      ]
    );
    res.status(201).json(decorate({ ...result.rows[0], visit_count: 0, lifetime_value: 0, active_count: 0 }));
  } catch (err) {
    console.error('POST /customers', err);
    res.status(500).json({ error: 'שגיאה ביצירת לקוחה' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  if (!isUuid(req.params.id)) return res.status(400).json({ error: 'מזהה לא תקין' });
  try {
    const curr = await db.query(
      'SELECT * FROM customers WHERE id=$1 AND business_id=$2',
      [req.params.id, req.user.id]
    );
    if (!curr.rows[0]) return res.status(404).json({ error: 'לקוחה לא נמצאה' });

    const body = req.body || {};
    let name = curr.rows[0].name;
    if (body.name !== undefined) {
      name = cleanName(body.name);
      if (!name || name.length < 2) return res.status(400).json({ error: 'שם לא תקין' });
    }

    let phone = curr.rows[0].phone;
    let phoneNormalized = curr.rows[0].phone_normalized;
    if (body.phone !== undefined) {
      const parsed = normalizePhone(body.phone);
      if (String(body.phone || '').trim() && !parsed.valid) {
        return res.status(400).json({ error: 'מספר טלפון לא תקין' });
      }
      phone = parsed.normalized || (String(body.phone || '').trim() || null);
      phoneNormalized = parsed.normalized;
      if (phoneNormalized) {
        const clash = await db.query(
          'SELECT id FROM customers WHERE business_id=$1 AND phone_normalized=$2 AND id<>$3',
          [req.user.id, phoneNormalized, req.params.id]
        );
        if (clash.rows[0]) return res.status(409).json({ error: 'מספר הטלפון כבר משויך ללקוחה אחרת' });
      }
    }

    let birthday = curr.rows[0].birthday;
    if (body.birthday !== undefined) {
      const parsedB = parseBirthday(body.birthday);
      if (parsedB === undefined) return res.status(400).json({ error: 'תאריך לידה לא תקין' });
      birthday = parsedB;
    }

    const source = body.source !== undefined ? sanitizeSource(body.source) : curr.rows[0].source;
    const sourceDetail = body.source_detail !== undefined
      ? (body.source_detail ? String(body.source_detail).trim().slice(0, 255) : null)
      : curr.rows[0].source_detail;
    const notes = body.notes !== undefined
      ? (body.notes ? String(body.notes).slice(0, 2000) : null)
      : curr.rows[0].notes;
    const preferences = body.preferences !== undefined
      ? sanitizePreferences(body.preferences)
      : (curr.rows[0].preferences || {});
    const isVip = body.is_vip !== undefined ? !!body.is_vip : !!curr.rows[0].is_vip;
    const email = body.email !== undefined
      ? (body.email ? String(body.email).trim() : null)
      : curr.rows[0].email;

    const updated = await db.query(
      `UPDATE customers
       SET name=$1, phone=$2, phone_normalized=$3, email=$4, birthday=$5,
           source=$6, source_detail=$7, notes=$8, preferences=$9::jsonb, is_vip=$10, updated_at=NOW()
       WHERE id=$11 AND business_id=$12
       RETURNING *`,
      [name, phone, phoneNormalized, email, birthday, source, sourceDetail, notes, JSON.stringify(preferences), isVip, req.params.id, req.user.id]
    );
    const decorated = await db.query(`${LIST_SQL} AND c.id = $3`, [req.user.id, '', req.params.id]);
    res.json(decorate(decorated.rows[0] || { ...updated.rows[0], visit_count: 0, lifetime_value: 0 }));
  } catch (err) {
    console.error('PATCH /customers/:id', err);
    res.status(500).json({ error: 'שגיאה בעדכון הלקוחה' });
  }
});

module.exports = router;
