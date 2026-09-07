const {
  TIMEZONE,
  getZonedParts,
  zonedTimeToUtc,
  saturdayBeforeSunday,
  hoursBefore,
} = require('./israelTime');
const { buildReminderMessage } = require('./smsMessage');

const CONSERVATIVE_SHABBAT = {
  fridayHour: 14,
  fridayMinute: 0,
  saturdayEndHour: 22,
  saturdayEndMinute: 30,
};

const MISSED_SEND_WINDOW_MS = 2 * 60 * 60 * 1000;
const MANUAL_OVERDUE_CANCEL_REASON = 'manual_overdue_safety';

function reminderErrorOf(record) {
  return (record && (record.error || record.reason)) || null;
}

function isOutsideSendWindow(scheduledAt, now) {
  if (!scheduledAt) return false;
  const scheduled = new Date(scheduledAt);
  if (Number.isNaN(scheduled.getTime())) return false;
  const t = now instanceof Date ? now : new Date(now);
  return t.getTime() - scheduled.getTime() > MISSED_SEND_WINDOW_MS;
}

function sameSlotClosedReason(existing, nextKey) {
  if (!existing) return null;
  const key = existing.dedupKey || existing.dedup_key;
  if (key !== nextKey) return null;
  if (existing.status === 'sent') return 'already_sent';
  const err = reminderErrorOf(existing);
  if (existing.status === 'skipped' && err === 'missed_send_window') return 'missed_send_window';
  if (existing.status === 'cancelled' && err === MANUAL_OVERDUE_CANCEL_REASON) return MANUAL_OVERDUE_CANCEL_REASON;
  return null;
}

function reminderTimeStamp(appointmentTime) {
  const at = appointmentTime instanceof Date ? appointmentTime : new Date(appointmentTime);
  return Number.isNaN(at.getTime()) ? 'unknown' : at.toISOString();
}

function reminderDedupKey(appointmentId, appointmentTime) {
  if (appointmentTime == null) return `appointment:${appointmentId}:reminder`;
  return `appointment:${appointmentId}:reminder:${reminderTimeStamp(appointmentTime)}`;
}

function conservativeShabbatEnd(saturdayIso) {
  const [year, month, day] = saturdayIso.split('-').map(Number);
  return zonedTimeToUtc(
    year,
    month,
    day,
    CONSERVATIVE_SHABBAT.saturdayEndHour,
    CONSERVATIVE_SHABBAT.saturdayEndMinute,
    TIMEZONE
  );
}

function conservativeIsShabbat(now) {
  const parts = getZonedParts(now, TIMEZONE);
  if (parts.weekday === 5) {
    return parts.hour > CONSERVATIVE_SHABBAT.fridayHour
      || (parts.hour === CONSERVATIVE_SHABBAT.fridayHour && parts.minute >= CONSERVATIVE_SHABBAT.fridayMinute);
  }
  if (parts.weekday === 6) {
    return parts.hour < CONSERVATIVE_SHABBAT.saturdayEndHour
      || (parts.hour === CONSERVATIVE_SHABBAT.saturdayEndHour && parts.minute < CONSERVATIVE_SHABBAT.saturdayEndMinute);
  }
  return false;
}

function isDuringShabbatWithTimes(now, { candleLighting, havdalah } = {}) {
  if (!candleLighting || !havdalah) return conservativeIsShabbat(now);
  const t = now instanceof Date ? now : new Date(now);
  return t >= candleLighting && t < havdalah;
}

async function resolveIsDuringShabbat(now, { getShabbatWindow } = {}) {
  const parts = getZonedParts(now, TIMEZONE);
  if (parts.weekday !== 5 && parts.weekday !== 6) return false;
  if (typeof getShabbatWindow !== 'function') return conservativeIsShabbat(now);
  try {
    const window = await getShabbatWindow(now);
    if (!window || !window.candleLighting || !window.havdalah) {
      return conservativeIsShabbat(now);
    }
    return isDuringShabbatWithTimes(now, window);
  } catch {
    return conservativeIsShabbat(now);
  }
}

function computeReminderSchedule(appointmentTime, { havdalahAt, havdalahError } = {}) {
  const parts = getZonedParts(appointmentTime, TIMEZONE);
  if (parts.weekday !== 0) {
    return {
      scheduledAt: hoursBefore(appointmentTime, 24),
      reason: 't24h',
      usedConservativeFallback: false,
    };
  }

  const saturdayIso = saturdayBeforeSunday(parts.isoDate);
  if (havdalahAt) {
    return {
      scheduledAt: havdalahAt instanceof Date ? havdalahAt : new Date(havdalahAt),
      reason: 'havdalah',
      saturdayIso,
      usedConservativeFallback: false,
    };
  }

  return {
    scheduledAt: conservativeShabbatEnd(saturdayIso),
    reason: 'havdalah_unavailable',
    saturdayIso,
    usedConservativeFallback: true,
    error: havdalahError || 'havdalah_unavailable',
  };
}

function scheduleReminderRecord({ existing, appointment, scheduledAt, reason, error }) {
  const status = appointment && appointment.status;
  if (!appointment || status === 'cancelled' || status === 'completed') {
    if (!existing) return { record: null, changed: false };
    if (existing.status === 'sent') return { record: existing, changed: false, blocked: 'already_sent' };
    return {
      record: { ...existing, status: 'cancelled', error: status === 'cancelled' ? 'appointment_cancelled' : 'appointment_completed', updatedAt: true },
      changed: existing.status !== 'cancelled',
    };
  }

  if (status !== 'confirmed') {
    return { record: existing || null, changed: false };
  }

  const appointmentTime = appointment.appointment_time || appointment.appointmentTime;
  const nextKey = reminderDedupKey(appointment.id, appointmentTime);
  const existingKey = existing && (existing.dedupKey || existing.dedup_key);
  const closed = sameSlotClosedReason(existing, nextKey);
  if (closed) {
    return { record: existing, changed: false, blocked: closed };
  }

  const next = {
    appointmentId: appointment.id,
    businessId: appointment.business_id || appointment.businessId,
    dedupKey: nextKey,
    phone: appointment.customer_phone || appointment.customerPhone || null,
    message: buildReminderMessage({
      customerName: appointment.customer_name || appointment.customerName,
      appointmentTime,
      serviceName: appointment.service_name || appointment.serviceName,
    }),
    scheduledAt,
    sentAt: null,
    status: 'pending',
    reason: reason || null,
    error: error || null,
    providerResponse: existing && existingKey === nextKey
      ? existing.providerResponse || existing.provider_response || null
      : null,
  };

  return { record: next, changed: true };
}

function decideSend(reminder, appointment, now, { isShabbat, smsEnabled } = {}) {
  if (!reminder || reminder.status === 'sent' || reminder.status === 'cancelled' || reminder.status === 'skipped') {
    return { action: 'noop' };
  }
  if (!appointment || appointment.status === 'cancelled') {
    return { action: 'cancel', reason: 'appointment_cancelled' };
  }
  if (appointment.status === 'completed') {
    return { action: 'cancel', reason: 'appointment_completed' };
  }
  if (appointment.status !== 'confirmed') {
    return { action: 'cancel', reason: 'not_confirmed' };
  }

  const appointmentTime = new Date(appointment.appointment_time || appointment.appointmentTime);
  if (Number.isNaN(appointmentTime.getTime()) || appointmentTime <= now) {
    return { action: 'skip', reason: 'appointment_passed' };
  }
  if (!smsEnabled) return { action: 'hold', reason: 'sms_disabled' };

  const scheduledAt = reminder.scheduledAt || reminder.scheduled_at;
  if (!scheduledAt || new Date(scheduledAt) > now) {
    return { action: 'hold', reason: 'not_due' };
  }
  if (isShabbat) {
    return { action: 'defer_shabbat', reason: 'shabbat' };
  }
  if (isOutsideSendWindow(scheduledAt, now)) {
    return { action: 'skip', reason: 'missed_send_window' };
  }
  const phone = reminder.phone || appointment.customer_phone || appointment.customerPhone;
  if (!phone) return { action: 'skip', reason: 'missing_phone' };

  return { action: 'send' };
}

module.exports = {
  CONSERVATIVE_SHABBAT,
  MISSED_SEND_WINDOW_MS,
  MANUAL_OVERDUE_CANCEL_REASON,
  reminderTimeStamp,
  reminderDedupKey,
  conservativeShabbatEnd,
  conservativeIsShabbat,
  isDuringShabbatWithTimes,
  resolveIsDuringShabbat,
  isOutsideSendWindow,
  sameSlotClosedReason,
  computeReminderSchedule,
  scheduleReminderRecord,
  decideSend,
};
