const {
  TIMEZONE,
  getZonedParts,
  hebrewDayName,
  formatDayMonth,
  formatHourMinute,
  firstNameFrom,
} = require('./israelTime');

function buildReminderMessage({ customerName, appointmentTime, serviceName }) {
  const parts = getZonedParts(appointmentTime, TIMEZONE);
  const firstName = firstNameFrom(customerName);
  const dayName = hebrewDayName(parts.weekday);
  const date = formatDayMonth(parts);
  const time = formatHourMinute(parts);
  const service = String(serviceName || 'טיפול').trim() || 'טיפול';

  return [
    `היי ${firstName}, זו ליאור 🎀`,
    'מחכה לפגוש אותך מחר ☺️',
    `${dayName} ${date} ב-${time} – ${service}`,
    '📍 הרב הרצוג 25, גבעת שמואל, משפחת דנינו (דגל ישראל). צלצלי בשער ואפתח לך, ומשם תרדי למטה.',
    'ברכב? כדאי להגיע כמה דקות מוקדם.',
    'לשאלות: 0535249688',
    'ליאור שגב | liors_beauty',
  ].join('\n');
}

function buildManualTestMessage(phone) {
  return [
    'זו הודעת בדיקה ממערכת התזכורות של ליאור.',
    'אם קיבלת אותה — החיבור ל-SMS עובד.',
    `נשלחה אל ${phone}`,
    'ליאור שגב | liors_beauty',
  ].join('\n');
}

module.exports = { buildReminderMessage, buildManualTestMessage };
