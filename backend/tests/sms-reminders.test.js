const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  TIMEZONE,
  getZonedParts,
  zonedTimeToUtc,
  saturdayBeforeSunday,
  firstNameFrom,
} = require('../lib/israelTime');
const { buildReminderMessage } = require('../lib/smsMessage');
const {
  reminderDedupKey,
  conservativeIsShabbat,
  conservativeShabbatEnd,
  isDuringShabbatWithTimes,
  computeReminderSchedule,
  scheduleReminderRecord,
  decideSend,
} = require('../lib/reminderPolicy');
const {
  parseHavdalahFromItems,
  parseCandlesFromItems,
  getHavdalahForSaturday,
  getHavdalahForAppointment,
  clearHavdalahCache,
} = require('../lib/havdalah');
const { toRecipient } = require('../lib/smsProvider');

const OCTOBER_2026_ITEMS = [
  { category: 'candles', date: '2026-10-02T18:04:00+03:00' },
  { category: 'havdalah', date: '2026-10-03T19:05:00+03:00' },
  { category: 'candles', date: '2026-10-09T17:55:00+03:00' },
  { category: 'havdalah', date: '2026-10-10T18:57:00+03:00' },
];

function jerusalem(year, month, day, hour, minute) {
  return zonedTimeToUtc(year, month, day, hour, minute, TIMEZONE);
}

function runWorkerTick(reminders, appointmentsById, now, { isShabbat, smsEnabled, send }) {
  const sent = [];
  for (const reminder of reminders) {
    const appointment = appointmentsById.get(reminder.appointmentId);
    const decision = decideSend(reminder, appointment, now, { isShabbat, smsEnabled });
    if (decision.action === 'cancel') {
      reminder.status = 'cancelled';
      reminder.error = decision.reason;
      continue;
    }
    if (decision.action === 'skip') {
      reminder.status = 'skipped';
      reminder.error = decision.reason;
      continue;
    }
    if (decision.action === 'defer_shabbat') {
      reminder.error = 'shabbat_blocked';
      continue;
    }
    if (decision.action === 'send') {
      send(reminder);
      reminder.status = 'sent';
      reminder.sentAt = now;
      sent.push(reminder.dedupKey);
    }
  }
  return sent;
}

describe('israel time', () => {
  it('treats 5 Oct 2026 18:30 as Monday in Asia/Jerusalem', () => {
    const at = jerusalem(2026, 10, 5, 18, 30);
    const parts = getZonedParts(at);
    assert.equal(parts.weekday, 1);
    assert.equal(parts.isoDate, '2026-10-05');
    assert.equal(parts.hour, 18);
    assert.equal(parts.minute, 30);
    assert.equal(at.toISOString(), '2026-10-05T15:30:00.000Z');
  });

  it('finds Saturday before a Sunday appointment', () => {
    assert.equal(saturdayBeforeSunday('2026-10-04'), '2026-10-03');
  });
});

describe('weekday reminder is 24 hours before', () => {
  it('schedules Monday 18:30 to Sunday 18:30', () => {
    const appointmentTime = jerusalem(2026, 10, 5, 18, 30);
    const schedule = computeReminderSchedule(appointmentTime);
    assert.equal(schedule.reason, 't24h');
    assert.equal(schedule.scheduledAt.toISOString(), jerusalem(2026, 10, 4, 18, 30).toISOString());
    assert.equal(getZonedParts(schedule.scheduledAt).weekday, 0);
  });
});

describe('Sunday reminder uses Tel Aviv havdalah', () => {
  it('schedules Sunday appointments to Saturday night havdalah, not 24h before', () => {
    const appointmentTime = jerusalem(2026, 10, 4, 10, 0);
    const havdalahAt = new Date('2026-10-03T19:05:00+03:00');
    const twentyFourHoursBefore = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
    assert.equal(getZonedParts(twentyFourHoursBefore).weekday, 6);

    const schedule = computeReminderSchedule(appointmentTime, { havdalahAt });
    assert.equal(schedule.reason, 'havdalah');
    assert.equal(schedule.scheduledAt.toISOString(), havdalahAt.toISOString());
    assert.equal(getZonedParts(schedule.scheduledAt).weekday, 6);
    assert.notEqual(schedule.scheduledAt.toISOString(), twentyFourHoursBefore.toISOString());
  });

  it('uses the same Motzei Shabbat time for morning and evening Sunday appointments', () => {
    const havdalahAt = new Date('2026-10-03T19:05:00+03:00');
    const morning = computeReminderSchedule(jerusalem(2026, 10, 4, 10, 0), { havdalahAt });
    const evening = computeReminderSchedule(jerusalem(2026, 10, 4, 20, 0), { havdalahAt });
    assert.equal(morning.scheduledAt.toISOString(), evening.scheduledAt.toISOString());
  });

  it('parses havdalah from Hebcal calendar items', () => {
    const at = parseHavdalahFromItems(OCTOBER_2026_ITEMS, '2026-10-03');
    assert.equal(at.toISOString(), new Date('2026-10-03T19:05:00+03:00').toISOString());
    const candles = parseCandlesFromItems(OCTOBER_2026_ITEMS, '2026-10-09');
    assert.equal(candles.toISOString(), new Date('2026-10-09T17:55:00+03:00').toISOString());
  });
});

describe('reschedule updates an unsent reminder', () => {
  it('recomputes scheduledAt when the appointment moves', () => {
    const appointment = {
      id: 'appt-1',
      status: 'confirmed',
      customer_name: 'מיכל כהן',
      customer_phone: '0501234567',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
      service_name: 'הרמת ריסים',
    };
    const first = scheduleReminderRecord({
      existing: null,
      appointment,
      scheduledAt: computeReminderSchedule(appointment.appointment_time).scheduledAt,
    });
    assert.equal(first.record.status, 'pending');
    assert.equal(first.record.dedupKey, reminderDedupKey('appt-1', appointment.appointment_time));

    const moved = {
      ...appointment,
      appointment_time: jerusalem(2026, 10, 6, 16, 0),
    };
    const second = scheduleReminderRecord({
      existing: first.record,
      appointment: moved,
      scheduledAt: computeReminderSchedule(moved.appointment_time).scheduledAt,
    });
    assert.equal(second.changed, true);
    assert.equal(second.record.scheduledAt.toISOString(), jerusalem(2026, 10, 5, 16, 0).toISOString());
    assert.match(second.record.message, /יום שלישי 6\.10 ב-16:00/);
  });

  it('does not create a second send for the same appointment time', () => {
    const appointmentTime = jerusalem(2026, 10, 5, 18, 30);
    const existing = {
      status: 'sent',
      sentAt: jerusalem(2026, 10, 4, 18, 30),
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      dedupKey: reminderDedupKey('appt-1', appointmentTime),
    };
    const result = scheduleReminderRecord({
      existing,
      appointment: {
        id: 'appt-1',
        status: 'confirmed',
        appointment_time: appointmentTime,
        customer_name: 'מיכל',
        service_name: 'לק גל',
      },
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
    });
    assert.equal(result.changed, false);
    assert.equal(result.blocked, 'already_sent');
    assert.equal(result.record.status, 'sent');
  });

  it('creates a new reminder after a sent one when the appointment time changes', () => {
    const oldTime = jerusalem(2026, 10, 5, 18, 30);
    const newTime = jerusalem(2026, 10, 7, 11, 0);
    const existing = {
      status: 'sent',
      sentAt: jerusalem(2026, 10, 4, 18, 30),
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      dedupKey: reminderDedupKey('appt-1', oldTime),
    };
    const result = scheduleReminderRecord({
      existing,
      appointment: {
        id: 'appt-1',
        status: 'confirmed',
        appointment_time: newTime,
        customer_name: 'מיכל',
        customer_phone: '0501234567',
        service_name: 'לק גל',
      },
      scheduledAt: computeReminderSchedule(newTime).scheduledAt,
    });
    assert.equal(result.changed, true);
    assert.equal(result.record.status, 'pending');
    assert.equal(result.record.dedupKey, reminderDedupKey('appt-1', newTime));
    assert.notEqual(result.record.dedupKey, existing.dedupKey);
  });
});

describe('cancel prevents SMS', () => {
  it('marks the reminder cancelled and the worker does not send', () => {
    const appointment = {
      id: 'appt-2',
      status: 'cancelled',
      customer_name: 'נועה',
      customer_phone: '0521234567',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
      service_name: 'עיצוב גבות',
    };
    const existing = {
      appointmentId: 'appt-2',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      phone: '0521234567',
    };
    const next = scheduleReminderRecord({
      existing,
      appointment,
      scheduledAt: existing.scheduledAt,
    });
    assert.equal(next.record.status, 'cancelled');

    const sends = [];
    const sent = runWorkerTick(
      [next.record],
      new Map([['appt-2', appointment]]),
      jerusalem(2026, 10, 4, 18, 31),
      { isShabbat: false, smsEnabled: true, send: (r) => sends.push(r) }
    );
    assert.deepEqual(sent, []);
    assert.equal(sends.length, 0);
  });
});

describe('restart does not double-send', () => {
  it('sends once, then a second worker tick is a no-op', () => {
    const reminder = {
      appointmentId: 'appt-3',
      dedupKey: reminderDedupKey('appt-3', jerusalem(2026, 10, 5, 18, 30)),
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      phone: '0501234567',
    };
    const appointment = {
      id: 'appt-3',
      status: 'confirmed',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
      customer_phone: '0501234567',
    };
    const sends = [];
    const send = (r) => sends.push(r.dedupKey);
    const now = jerusalem(2026, 10, 4, 18, 31);
    const first = runWorkerTick([reminder], new Map([['appt-3', appointment]]), now, {
      isShabbat: false,
      smsEnabled: true,
      send,
    });
    const second = runWorkerTick([reminder], new Map([['appt-3', appointment]]), now, {
      isShabbat: false,
      smsEnabled: true,
      send,
    });
    assert.deepEqual(first, [reminder.dedupKey]);
    assert.deepEqual(second, []);
    assert.equal(sends.length, 1);
    assert.equal(reminder.status, 'sent');
  });
});

describe('Hebcal outage never sends during Shabbat', () => {
  it('falls back to Saturday 22:30 and still blocks Saturday afternoon', () => {
    const appointmentTime = jerusalem(2026, 10, 4, 15, 0);
    const schedule = computeReminderSchedule(appointmentTime, { havdalahError: 'hebcal_down' });
    assert.equal(schedule.usedConservativeFallback, true);
    assert.equal(schedule.scheduledAt.toISOString(), conservativeShabbatEnd('2026-10-03').toISOString());
    assert.equal(getZonedParts(schedule.scheduledAt).hour, 22);
    assert.equal(getZonedParts(schedule.scheduledAt).minute, 30);

    const saturdayNoon = jerusalem(2026, 10, 3, 12, 0);
    assert.equal(conservativeIsShabbat(saturdayNoon), true);
    assert.equal(conservativeIsShabbat(jerusalem(2026, 10, 3, 22, 29)), true);
    assert.equal(conservativeIsShabbat(jerusalem(2026, 10, 3, 22, 30)), false);

    const reminder = {
      appointmentId: 'appt-4',
      status: 'pending',
      scheduledAt: saturdayNoon,
      phone: '0501234567',
    };
    const sends = [];
    const sent = runWorkerTick(
      [reminder],
      new Map([['appt-4', {
        id: 'appt-4',
        status: 'confirmed',
        appointment_time: appointmentTime,
        customer_phone: '0501234567',
      }]]),
      saturdayNoon,
      { isShabbat: conservativeIsShabbat(saturdayNoon), smsEnabled: true, send: (r) => sends.push(r) }
    );
    assert.deepEqual(sent, []);
    assert.equal(reminder.status, 'pending');
    assert.equal(reminder.error, 'shabbat_blocked');
    assert.equal(sends.length, 0);
  });

  it('uses Hebcal window when available so Friday afternoon before candles is not Shabbat', () => {
    const fridayNoon = jerusalem(2026, 10, 9, 12, 0);
    const fridayNight = jerusalem(2026, 10, 9, 20, 0);
    const saturdayAfternoon = jerusalem(2026, 10, 10, 12, 0);
    const afterHavdalah = jerusalem(2026, 10, 10, 19, 10);
    const window = {
      candleLighting: parseCandlesFromItems(OCTOBER_2026_ITEMS, '2026-10-09'),
      havdalah: parseHavdalahFromItems(OCTOBER_2026_ITEMS, '2026-10-10'),
    };
    assert.equal(isDuringShabbatWithTimes(fridayNoon, window), false);
    assert.equal(isDuringShabbatWithTimes(fridayNight, window), true);
    assert.equal(isDuringShabbatWithTimes(saturdayAfternoon, window), true);
    assert.equal(isDuringShabbatWithTimes(afterHavdalah, window), false);
  });
});

describe('message is built from appointment data', () => {
  it('fills first name, Hebrew weekday, D.M date, time and service', () => {
    const message = buildReminderMessage({
      customerName: 'מיכל כהן',
      appointmentTime: jerusalem(2026, 10, 5, 18, 30),
      serviceName: 'הרמת ריסים',
    });
    assert.equal(firstNameFrom('מיכל כהן'), 'מיכל');
    assert.ok(message.startsWith('היי מיכל, זו ליאור 🎀'));
    assert.match(message, /יום שני 5\.10 ב-18:30 – הרמת ריסים/);
    assert.match(message, /הרב הרצוג 25/);
    assert.doesNotMatch(message, /4\.10 ב-18:30/);
  });
});

describe('Hebcal client', () => {
  it('reads Saturday havdalah from the calendar payload', async () => {
    clearHavdalahCache();
    const at = await getHavdalahForSaturday('2026-10-03', {
      minutes: 42,
      requestJson: async ({ url }) => {
        assert.match(url, /geonameid=293397/);
        assert.match(url, /m=42/);
        return { statusCode: 200, body: { items: OCTOBER_2026_ITEMS } };
      },
    });
    assert.equal(at.toISOString(), new Date('2026-10-03T19:05:00+03:00').toISOString());
  });

  it('throws when Hebcal calendar and zmanim are both down', async () => {
    clearHavdalahCache();
    await assert.rejects(
      () => getHavdalahForSaturday('2026-10-03', {
        requestJson: async () => { throw new Error('hebcal_down'); },
      }),
      /hebcal_down|zmanim|havdalah/i
    );
    assert.equal(await getHavdalahForAppointment(jerusalem(2026, 10, 5, 18, 30)), null);
  });
});

describe('sms recipient', () => {
  it('normalizes Israeli mobile numbers', () => {
    assert.equal(toRecipient('053-524-9688'), '0535249688');
    assert.equal(toRecipient('not-a-phone'), null);
  });
});

describe('missed send window', () => {
  it('allows a reminder that is 30 minutes late', () => {
    const now = jerusalem(2026, 10, 4, 19, 0);
    const reminder = {
      appointmentId: 'appt-late-30',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      phone: '0501234567',
    };
    const appointment = {
      id: 'appt-late-30',
      status: 'confirmed',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
      customer_phone: '0501234567',
    };
    assert.equal(
      decideSend(reminder, appointment, now, { isShabbat: false, smsEnabled: true }).action,
      'send'
    );
    const sends = [];
    const sent = runWorkerTick([reminder], new Map([['appt-late-30', appointment]]), now, {
      isShabbat: false,
      smsEnabled: true,
      send: (r) => sends.push(r),
    });
    assert.equal(sent.length, 1);
    assert.equal(sends.length, 1);
    assert.equal(reminder.status, 'sent');
  });

  it('skips a reminder that is 3 hours late and does not send it', () => {
    const now = jerusalem(2026, 10, 4, 21, 30);
    const reminder = {
      appointmentId: 'appt-late-3h',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      phone: '0501234567',
    };
    const appointment = {
      id: 'appt-late-3h',
      status: 'confirmed',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
      customer_phone: '0501234567',
    };
    const decision = decideSend(reminder, appointment, now, { isShabbat: false, smsEnabled: true });
    assert.equal(decision.action, 'skip');
    assert.equal(decision.reason, 'missed_send_window');

    const sends = [];
    const sent = runWorkerTick([reminder], new Map([['appt-late-3h', appointment]]), now, {
      isShabbat: false,
      smsEnabled: true,
      send: (r) => sends.push(r),
    });
    assert.deepEqual(sent, []);
    assert.equal(sends.length, 0);
    assert.equal(reminder.status, 'skipped');
    assert.equal(reminder.error, 'missed_send_window');
  });

  it('does not send a pile of old reminders after restart', () => {
    const now = jerusalem(2026, 10, 4, 22, 0);
    const oldA = {
      appointmentId: 'old-1',
      dedupKey: 'old-1',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 10, 0),
      phone: '0501111111',
    };
    const oldB = {
      appointmentId: 'old-2',
      dedupKey: 'old-2',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 12, 0),
      phone: '0502222222',
    };
    const late30 = {
      appointmentId: 'late-30',
      dedupKey: 'late-30',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 21, 30),
      phone: '0503333333',
    };
    const future = {
      appointmentId: 'future-1',
      dedupKey: 'future-1',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 5, 12, 0),
      phone: '0504444444',
    };
    const appointments = new Map([
      ['old-1', { id: 'old-1', status: 'confirmed', appointment_time: jerusalem(2026, 10, 5, 10, 0), customer_phone: '0501111111' }],
      ['old-2', { id: 'old-2', status: 'confirmed', appointment_time: jerusalem(2026, 10, 5, 12, 0), customer_phone: '0502222222' }],
      ['late-30', { id: 'late-30', status: 'confirmed', appointment_time: jerusalem(2026, 10, 5, 21, 30), customer_phone: '0503333333' }],
      ['future-1', { id: 'future-1', status: 'confirmed', appointment_time: jerusalem(2026, 10, 6, 12, 0), customer_phone: '0504444444' }],
    ]);
    const sends = [];
    const sent = runWorkerTick([oldA, oldB, late30, future], appointments, now, {
      isShabbat: false,
      smsEnabled: true,
      send: (r) => sends.push(r.dedupKey),
    });
    assert.deepEqual(sent, ['late-30']);
    assert.equal(sends.length, 1);
    assert.equal(oldA.status, 'skipped');
    assert.equal(oldA.error, 'missed_send_window');
    assert.equal(oldB.status, 'skipped');
    assert.equal(oldB.error, 'missed_send_window');
    assert.equal(late30.status, 'sent');
    assert.equal(future.status, 'pending');
  });

  it('keeps future reminders pending', () => {
    const now = jerusalem(2026, 10, 4, 18, 31);
    const reminder = {
      appointmentId: 'future-2',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 9, 12, 15),
      phone: '0501234567',
    };
    const appointment = {
      id: 'future-2',
      status: 'confirmed',
      appointment_time: jerusalem(2026, 10, 10, 12, 15),
      customer_phone: '0501234567',
    };
    const decision = decideSend(reminder, appointment, now, { isShabbat: false, smsEnabled: true });
    assert.equal(decision.action, 'hold');
    assert.equal(decision.reason, 'not_due');
    const sends = [];
    runWorkerTick([reminder], new Map([['future-2', appointment]]), now, {
      isShabbat: false,
      smsEnabled: true,
      send: (r) => sends.push(r),
    });
    assert.equal(sends.length, 0);
    assert.equal(reminder.status, 'pending');
  });

  it('still defers during Shabbat even if the original send time is more than 2 hours late', () => {
    const reminder = {
      appointmentId: 'appt-shabbat-late',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 2, 16, 0),
      phone: '0501234567',
    };
    const appointment = {
      id: 'appt-shabbat-late',
      status: 'confirmed',
      appointment_time: jerusalem(2026, 10, 4, 16, 0),
      customer_phone: '0501234567',
    };
    const saturdayAfternoon = jerusalem(2026, 10, 3, 16, 0);
    const decision = decideSend(reminder, appointment, saturdayAfternoon, {
      isShabbat: true,
      smsEnabled: true,
    });
    assert.equal(decision.action, 'defer_shabbat');
  });
});

describe('only confirmed appointments are sendable', () => {
  it('holds a pending booking and skips when SMS is disabled', () => {
    const reminder = {
      appointmentId: 'appt-5',
      status: 'pending',
      scheduledAt: jerusalem(2026, 10, 4, 18, 30),
      phone: '0501234567',
    };
    const pendingAppt = {
      id: 'appt-5',
      status: 'pending',
      appointment_time: jerusalem(2026, 10, 5, 18, 30),
    };
    assert.equal(
      decideSend(reminder, pendingAppt, jerusalem(2026, 10, 4, 18, 31), { isShabbat: false, smsEnabled: true }).action,
      'cancel'
    );
    const confirmed = { ...pendingAppt, status: 'confirmed' };
    assert.equal(
      decideSend(reminder, confirmed, jerusalem(2026, 10, 4, 18, 31), { isShabbat: false, smsEnabled: false }).action,
      'hold'
    );
  });
});
