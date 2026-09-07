const TIMEZONE = 'Asia/Jerusalem';
const WEEKDAY_FROM_SHORT = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const HEBREW_DAY_NAMES = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];

function getZonedParts(date, timeZone = TIMEZONE) {
  const instant = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(instant.getTime())) {
    throw new Error('Invalid date');
  }
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const map = {};
  for (const part of fmt.formatToParts(instant)) {
    if (part.type !== 'literal') map[part.type] = part.value;
  }
  const weekday = WEEKDAY_FROM_SHORT[map.weekday];
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    weekday,
    isoDate: `${map.year}-${map.month}-${map.day}`,
  };
}

function getTimeZoneOffsetMs(date, timeZone = TIMEZONE) {
  const instant = date instanceof Date ? date : new Date(date);
  const parts = getZonedParts(instant, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - instant.getTime();
}

function zonedTimeToUtc(year, month, day, hour, minute, timeZone = TIMEZONE) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0) - offset;
  offset = getTimeZoneOffsetMs(new Date(utc), timeZone);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offset);
}

function addCalendarDays(isoDate, days, timeZone = TIMEZONE) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const noon = zonedTimeToUtc(year, month, day, 12, 0, timeZone);
  const shifted = new Date(noon.getTime() + days * 24 * 60 * 60 * 1000);
  return getZonedParts(shifted, timeZone).isoDate;
}

function saturdayBeforeSunday(isoDate) {
  return addCalendarDays(isoDate, -1);
}

function hoursBefore(date, hours) {
  const instant = date instanceof Date ? date : new Date(date);
  return new Date(instant.getTime() - hours * 60 * 60 * 1000);
}

function hebrewDayName(weekday) {
  return HEBREW_DAY_NAMES[weekday] || '';
}

function formatDayMonth(parts) {
  return `${parts.day}.${parts.month}`;
}

function formatHourMinute(parts) {
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function firstNameFrom(fullName) {
  const cleaned = String(fullName || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'לקוחה';
  return cleaned.split(' ')[0];
}

module.exports = {
  TIMEZONE,
  HEBREW_DAY_NAMES,
  getZonedParts,
  getTimeZoneOffsetMs,
  zonedTimeToUtc,
  addCalendarDays,
  saturdayBeforeSunday,
  hoursBefore,
  hebrewDayName,
  formatDayMonth,
  formatHourMinute,
  firstNameFrom,
};
