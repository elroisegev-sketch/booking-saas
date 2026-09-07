const {
  applySmsReminderSchema,
  backfillMissingReminders,
  processDueReminders,
} = require('./smsReminders');
const { isSmsEnabled } = require('./smsService');

const DEFAULT_INTERVAL_MS = 30000;
let timer = null;

function isSmsWorkerRunning() {
  return Boolean(timer);
}

function startSmsWorker({ intervalMs } = {}) {
  if (timer) return timer;
  const ms = intervalMs || parseInt(process.env.SMS_WORKER_INTERVAL_MS, 10) || DEFAULT_INTERVAL_MS;

  const tick = async () => {
    try {
      await backfillMissingReminders();
      const result = await processDueReminders();
      if (result.processed || result.sent) {
        console.log('📨 SMS worker', result);
      }
    } catch (err) {
      console.error('SMS worker tick error:', err.message);
    }
  };

  timer = setInterval(tick, ms);
  if (typeof timer.unref === 'function') timer.unref();
  console.log(`📨 SMS worker started (interval=${ms}ms, enabled=${isSmsEnabled()})`);
  tick().catch((err) => console.error('SMS worker first tick error:', err.message));
  return timer;
}

function stopSmsWorker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function initSmsReminders(db) {
  await applySmsReminderSchema(db);
  startSmsWorker();
}

module.exports = { startSmsWorker, stopSmsWorker, initSmsReminders, isSmsWorkerRunning };
