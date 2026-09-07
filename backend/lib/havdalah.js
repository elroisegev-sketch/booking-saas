const { TIMEZONE, getZonedParts, saturdayBeforeSunday, zonedTimeToUtc } = require('./israelTime');
const { conservativeShabbatEnd } = require('./reminderPolicy');
const { httpsRequestJson } = require('./httpJson');

const TEL_AVIV_GEONAMEID = 293397;
const DEFAULT_HAVDALAH_MINUTES = 42;
const cache = new Map();

function havdalahMinutes(override) {
  if (override != null) {
    const n = parseInt(override, 10);
    if (Number.isFinite(n) && n > 0 && n <= 120) return n;
  }
  const n = parseInt(process.env.HAVDALAH_MINUTES, 10);
  return Number.isFinite(n) && n > 0 && n <= 120 ? n : DEFAULT_HAVDALAH_MINUTES;
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value, ttlMs) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function clearHavdalahCache() {
  cache.clear();
}

function parseTimedItem(items, category, isoDate) {
  if (!Array.isArray(items)) return null;
  const found = items.find((item) => {
    if (!item || item.category !== category || !item.date) return false;
    return String(item.date).startsWith(isoDate);
  });
  if (!found) return null;
  const at = new Date(found.date);
  return Number.isNaN(at.getTime()) ? null : at;
}

function parseHavdalahFromItems(items, saturdayIso) {
  return parseTimedItem(items, 'havdalah', saturdayIso);
}

function parseCandlesFromItems(items, fridayIso) {
  return parseTimedItem(items, 'candles', fridayIso);
}

function hebcalUrl(pathAndQuery) {
  return `https://www.hebcal.com${pathAndQuery}`;
}

async function fetchHebcal(pathAndQuery, requestJson = httpsRequestJson) {
  const result = await requestJson({
    url: hebcalUrl(pathAndQuery),
    timeoutMs: 6000,
    headers: { 'User-Agent': 'BookSlot/1.0 (lioryourbeauty.com; sms-reminders)' },
  });
  if (result.statusCode < 200 || result.statusCode >= 300 || !result.body) {
    throw new Error(`hebcal_http_${result.statusCode || 'error'}`);
  }
  return result.body;
}

async function fetchHavdalahFromCalendar(saturdayIso, minutes, requestJson) {
  const [year, month] = saturdayIso.split('-');
  const body = await fetchHebcal(
    `/hebcal?v=1&cfg=json&maj=off&min=off&mod=off&nx=off&year=${year}&month=${Number(month)}&ss=off&mf=off&c=on&geo=geoname&geonameid=${TEL_AVIV_GEONAMEID}&m=${minutes}&s=off&leyning=off`,
    requestJson
  );
  const at = parseHavdalahFromItems(body.items, saturdayIso);
  if (!at) throw new Error('havdalah_missing_in_calendar');
  return at;
}

async function fetchHavdalahFromZmanim(saturdayIso, minutes, requestJson) {
  const body = await fetchHebcal(
    `/zmanim?cfg=json&geonameid=${TEL_AVIV_GEONAMEID}&date=${saturdayIso}`,
    requestJson
  );
  const times = body && body.times;
  if (!times) throw new Error('zmanim_missing');
  const named = {
    42: times.tzeit42min,
    50: times.tzeit50min,
    72: times.tzeit72min,
  }[minutes];
  if (named) {
    const at = new Date(named);
    if (!Number.isNaN(at.getTime())) return at;
  }
  if (!times.sunset) throw new Error('zmanim_sunset_missing');
  const sunset = new Date(times.sunset);
  if (Number.isNaN(sunset.getTime())) throw new Error('zmanim_sunset_invalid');
  return new Date(sunset.getTime() + minutes * 60 * 1000);
}

async function getHavdalahForSaturday(saturdayIso, { minutes, requestJson } = {}) {
  const m = havdalahMinutes(minutes);
  const key = `havdalah:${saturdayIso}:${m}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const fetchJson = requestJson || httpsRequestJson;
  let lastError;
  try {
    const at = await fetchHavdalahFromCalendar(saturdayIso, m, fetchJson);
    return cacheSet(key, at, 12 * 60 * 60 * 1000);
  } catch (err) {
    lastError = err;
  }
  try {
    const at = await fetchHavdalahFromZmanim(saturdayIso, m, fetchJson);
    return cacheSet(key, at, 12 * 60 * 60 * 1000);
  } catch (err) {
    lastError = err;
  }
  const error = new Error(lastError ? lastError.message : 'havdalah_unavailable');
  error.code = 'HAVDALAH_UNAVAILABLE';
  throw error;
}

async function getHavdalahForAppointment(appointmentTime, options) {
  const parts = getZonedParts(appointmentTime, TIMEZONE);
  if (parts.weekday !== 0) return null;
  return getHavdalahForSaturday(saturdayBeforeSunday(parts.isoDate), options);
}

async function getShabbatWindow(now, { minutes, requestJson } = {}) {
  const parts = getZonedParts(now, TIMEZONE);
  let fridayIso;
  let saturdayIso;
  if (parts.weekday === 5) {
    fridayIso = parts.isoDate;
    saturdayIso = addOneDay(fridayIso);
  } else if (parts.weekday === 6) {
    saturdayIso = parts.isoDate;
    fridayIso = saturdayBeforeSunday(saturdayIso);
  } else {
    return null;
  }

  const m = havdalahMinutes(minutes);
  const key = `window:${fridayIso}:${saturdayIso}:${m}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const fetchJson = requestJson || httpsRequestJson;
  const [gy, gm, gd] = fridayIso.split('-');
  try {
    const body = await fetchHebcal(
      `/shabbat?cfg=json&geonameid=${TEL_AVIV_GEONAMEID}&m=${m}&leyning=off&gy=${gy}&gm=${Number(gm)}&gd=${Number(gd)}`,
      fetchJson
    );
    const candleLighting = parseCandlesFromItems(body.items, fridayIso);
    const havdalah = parseHavdalahFromItems(body.items, saturdayIso);
    if (candleLighting && havdalah) {
      return cacheSet(key, { candleLighting, havdalah, fridayIso, saturdayIso }, 60 * 60 * 1000);
    }
  } catch {
    // fall through to conservative
  }
  return {
    candleLighting: zonedTimeToUtc(...isoToYmd(fridayIso), 14, 0, TIMEZONE),
    havdalah: conservativeShabbatEnd(saturdayIso),
    fridayIso,
    saturdayIso,
    conservative: true,
  };
}

function addOneDay(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const noon = zonedTimeToUtc(year, month, day, 12, 0, TIMEZONE);
  return getZonedParts(new Date(noon.getTime() + 24 * 60 * 60 * 1000), TIMEZONE).isoDate;
}

function isoToYmd(isoDate) {
  return isoDate.split('-').map(Number);
}

module.exports = {
  TEL_AVIV_GEONAMEID,
  DEFAULT_HAVDALAH_MINUTES,
  havdalahMinutes,
  parseHavdalahFromItems,
  parseCandlesFromItems,
  getHavdalahForSaturday,
  getHavdalahForAppointment,
  getShabbatWindow,
  clearHavdalahCache,
};
