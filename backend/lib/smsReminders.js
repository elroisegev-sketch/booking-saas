const fs = require('fs');
const path = require('path');
const db = require('../db');
const { normalizePhone } = require('./phone');
const { TIMEZONE, getZonedParts, saturdayBeforeSunday } = require('./israelTime');
const { buildReminderMessage } = require('./smsMessage');
const { getHavdalahForAppointment, getShabbatWindow, havdalahMinutes } = require('./havdalah');
const {
  reminderDedupKey,
  computeReminderSchedule,
  scheduleReminderRecord,
  decideSend,
  resolveIsDuringShabbat,
  conservativeShabbatEnd,
} = require('./reminderPolicy');
const { isSmsEnabled, sendSms, getSmsCredentials } = require('./smsService');

const APPOINTMENT_SELECT = `
  SELECT a.id, a.business_id, a.customer_name, a.customer_phone,
         a.appointment_time, a.status,
         COALESCE(s.name, a.service_names_text, 'טיפול') AS service_name
  FROM appointments a
  LEFT JOIN services s ON a.service_id = s.id
`;

async function applySmsReminderSchema(database = db) {
  const sql = fs.readFileSync(path.join(__dirname, '../db/migrations/002_sms_reminders.sql'), 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/--[^\n]*/g, '').trim())
    .filter(Boolean);
  for (const statement of statements) {
    await database.query(statement);
  }
}

async function loadAppointment(appointmentId, database = db) {
  const result = await database.query(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [appointmentId]);
  return result.rows[0] || null;
}

async function loadReminder(appointmentId, appointmentTime, database = db) {
  const result = await database.query(
    'SELECT * FROM sms_reminders WHERE dedup_key = $1',
    [reminderDedupKey(appointmentId, appointmentTime)]
  );
  return result.rows[0] || null;
}

async function cancelUnsentForAppointment(appointmentId, reason, database = db) {
  await database.query(
    `UPDATE sms_reminders
     SET status = 'cancelled', error = $2, updated_at = NOW()
     WHERE appointment_id = $1 AND status IN ('pending', 'failed')`,
    [appointmentId, reason || 'appointment_cancelled']
  );
}

async function resolveScheduleForAppointment(appointment, { getHavdalah } = {}) {
  const appointmentTime = appointment.appointment_time;
  const parts = getZonedParts(appointmentTime, TIMEZONE);
  let havdalahAt = null;
  let havdalahError = null;
  if (parts.weekday === 0) {
    try {
      const fetchHavdalah = getHavdalah || getHavdalahForAppointment;
      havdalahAt = await fetchHavdalah(appointmentTime);
    } catch (err) {
      havdalahError = err.message || 'havdalah_unavailable';
      console.error('havdalah fetch failed, using conservative Motzei Shabbat:', havdalahError);
    }
  }
  return computeReminderSchedule(appointmentTime, { havdalahAt, havdalahError });
}

async function upsertReminder(record, database = db) {
  const parsed = normalizePhone(record.phone);
  const phone = parsed.valid ? parsed.normalized : (record.phone || null);
  const skipReason = parsed.valid ? null : 'invalid_phone';
  const status = skipReason ? 'skipped' : record.status;

  const result = await database.query(
    `INSERT INTO sms_reminders (
        appointment_id, business_id, dedup_key, phone, message,
        scheduled_at, sent_at, status, provider_response, error
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (dedup_key) DO UPDATE SET
        phone = EXCLUDED.phone,
        message = EXCLUDED.message,
        scheduled_at = CASE
          WHEN sms_reminders.status = 'sent' THEN sms_reminders.scheduled_at
          ELSE EXCLUDED.scheduled_at
        END,
        status = CASE
          WHEN sms_reminders.status = 'sent' THEN sms_reminders.status
          ELSE EXCLUDED.status
        END,
        error = CASE
          WHEN sms_reminders.status = 'sent' THEN sms_reminders.error
          ELSE EXCLUDED.error
        END,
        provider_response = CASE
          WHEN sms_reminders.status = 'sent' THEN sms_reminders.provider_response
          ELSE EXCLUDED.provider_response
        END,
        updated_at = NOW()
      RETURNING *`,
    [
      record.appointmentId,
      record.businessId,
      record.dedupKey,
      phone,
      record.message,
      record.scheduledAt,
      record.sentAt,
      status,
      record.providerResponse || null,
      skipReason || record.error || null,
    ]
  );
  return result.rows[0];
}

async function syncReminderForAppointment(appointmentId, { database = db, getHavdalah } = {}) {
  const appointment = await loadAppointment(appointmentId, database);
  if (!appointment) return null;

  if (appointment.status !== 'confirmed') {
    const reason = appointment.status === 'cancelled'
      ? 'appointment_cancelled'
      : appointment.status === 'completed'
        ? 'appointment_completed'
        : 'not_confirmed';
    await cancelUnsentForAppointment(appointment.id, reason, database);
    return null;
  }

  const currentKey = reminderDedupKey(appointment.id, appointment.appointment_time);
  await database.query(
    `UPDATE sms_reminders
     SET status = 'cancelled', error = 'appointment_rescheduled', updated_at = NOW()
     WHERE appointment_id = $1
       AND dedup_key <> $2
       AND status IN ('pending', 'failed')`,
    [appointment.id, currentKey]
  );

  const existing = await loadReminder(appointment.id, appointment.appointment_time, database);
  const schedule = await resolveScheduleForAppointment(appointment, { getHavdalah });
  const { record } = scheduleReminderRecord({
    existing,
    appointment,
    scheduledAt: schedule.scheduledAt,
    reason: schedule.reason,
    error: schedule.error || null,
  });
  if (!record || (existing && existing.status === 'sent')) return existing;
  return upsertReminder(record, database);
}

async function cancelReminderForAppointment(appointmentId, reason, database = db) {
  await cancelUnsentForAppointment(appointmentId, reason, database);
}

function syncReminderSafe(appointmentId) {
  return syncReminderForAppointment(appointmentId).catch((err) => {
    console.error('sms reminder sync error:', err.message);
    return null;
  });
}

function cancelReminderSafe(appointmentId, reason) {
  return cancelReminderForAppointment(appointmentId, reason).catch((err) => {
    console.error('sms reminder cancel error:', err.message);
    return null;
  });
}

async function backfillMissingReminders(database = db) {
  const result = await database.query(
    `SELECT a.id, a.appointment_time
     FROM appointments a
     WHERE a.status = 'confirmed'
       AND a.appointment_time > NOW()
     ORDER BY a.appointment_time ASC
     LIMIT 100`
  );
  let created = 0;
  for (const row of result.rows) {
    const existing = await loadReminder(row.id, row.appointment_time, database);
    if (existing && (existing.status === 'pending' || existing.status === 'sending' || existing.status === 'sent')) {
      continue;
    }
    await syncReminderForAppointment(row.id, { database }).catch((err) => {
      console.error('sms reminder backfill error:', err.message);
    });
    created += 1;
  }
  return created;
}

async function reclaimStuckSending(database = db) {
  // Do not auto-resend: a crash after the provider accepted the SMS would otherwise
  // send a duplicate. Stuck rows stay visible as failed for inspection.
  await database.query(
    `UPDATE sms_reminders
     SET status = 'failed', error = 'stuck_sending', updated_at = NOW()
     WHERE status = 'sending' AND updated_at < NOW() - INTERVAL '5 minutes'`
  );
}

async function claimDueReminders(database, sql, params) {
  const pool = database && database.pool;
  if (!pool || typeof pool.connect !== 'function') {
    return database.query(sql, params);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const claimed = await client.query(sql, params);
    await client.query('COMMIT');
    return claimed;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

async function processDueReminders({
  database = db,
  now = new Date(),
  smsEnabled = isSmsEnabled(),
  send = sendSms,
  getShabbatWindowFn = getShabbatWindow,
  limit = 10,
} = {}) {
  await reclaimStuckSending(database);
  if (!smsEnabled) {
    return { processed: 0, sent: 0, held: true };
  }

  const claimSql = `WITH due AS (
       SELECT id FROM sms_reminders
       WHERE status = 'pending'
         AND scheduled_at IS NOT NULL
         AND scheduled_at <= $1
       ORDER BY scheduled_at ASC
       LIMIT $2
       FOR UPDATE SKIP LOCKED
     )
     UPDATE sms_reminders AS r
     SET status = 'sending', updated_at = NOW()
     FROM due
     WHERE r.id = due.id
     RETURNING r.*`;
  const claimParams = [now.toISOString(), limit];
  const claimed = await claimDueReminders(database, claimSql, claimParams);

  let sent = 0;
  for (const reminder of claimed.rows) {
    const appointment = await loadAppointment(reminder.appointment_id, database);
    const isShabbat = await resolveIsDuringShabbat(now, { getShabbatWindow: getShabbatWindowFn });
    const decision = decideSend(reminder, appointment, now, { isShabbat, smsEnabled: true });

    if (decision.action === 'cancel') {
      await database.query(
        `UPDATE sms_reminders SET status='cancelled', error=$2, updated_at=NOW() WHERE id=$1`,
        [reminder.id, decision.reason]
      );
      continue;
    }
    if (decision.action === 'skip') {
      await database.query(
        `UPDATE sms_reminders SET status='skipped', error=$2, updated_at=NOW() WHERE id=$1`,
        [reminder.id, decision.reason]
      );
      continue;
    }
    if (decision.action === 'defer_shabbat') {
      const parts = appointment ? getZonedParts(appointment.appointment_time, TIMEZONE) : getZonedParts(now, TIMEZONE);
      const saturdayIso = parts.weekday === 0
        ? saturdayBeforeSunday(parts.isoDate)
        : parts.weekday === 6
          ? parts.isoDate
          : null;
      const retryAt = saturdayIso ? conservativeShabbatEnd(saturdayIso) : new Date(now.getTime() + 30 * 60 * 1000);
      await database.query(
        `UPDATE sms_reminders
         SET status='pending', scheduled_at=$2, error='shabbat_blocked', updated_at=NOW()
         WHERE id=$1`,
        [reminder.id, retryAt]
      );
      continue;
    }
    if (decision.action !== 'send') {
      await database.query(
        `UPDATE sms_reminders SET status='pending', updated_at=NOW() WHERE id=$1`,
        [reminder.id]
      );
      continue;
    }

    try {
      const message = reminder.message || buildReminderMessage({
        customerName: appointment.customer_name,
        appointmentTime: appointment.appointment_time,
        serviceName: appointment.service_name,
      });
      const phone = reminder.phone || appointment.customer_phone;
      const result = await send(phone, message);
      const providerResponse = {
        status: result.providerStatus == null ? null : result.providerStatus,
        message: result.providerMessage == null ? null : result.providerMessage,
      };
      if (!result.ok) {
        await database.query(
          `UPDATE sms_reminders
           SET status='failed', provider_response=$2, error=$3, updated_at=NOW()
           WHERE id=$1`,
          [reminder.id, providerResponse, result.code || result.error || 'provider_rejected']
        );
        continue;
      }
      await database.query(
        `UPDATE sms_reminders
         SET status='sent', sent_at=NOW(), provider_response=$2, error=NULL, updated_at=NOW()
         WHERE id=$1`,
        [reminder.id, providerResponse]
      );
      sent += 1;
    } catch (err) {
      await database.query(
        `UPDATE sms_reminders
         SET status='failed', error=$2, updated_at=NOW()
         WHERE id=$1`,
        [reminder.id, err.message || 'send_failed']
      );
    }
  }

  return { processed: claimed.rows.length, sent, held: false };
}

function smsRuntimeStatus() {
  const credentials = getSmsCredentials();
  return {
    smsEnabled: isSmsEnabled(),
    credentialsConfigured: credentials.configured,
    havdalahMinutes: havdalahMinutes(),
    timezone: TIMEZONE,
  };
}

module.exports = {
  applySmsReminderSchema,
  loadAppointment,
  syncReminderForAppointment,
  cancelReminderForAppointment,
  syncReminderSafe,
  cancelReminderSafe,
  backfillMissingReminders,
  processDueReminders,
  smsRuntimeStatus,
  reminderDedupKey,
};
