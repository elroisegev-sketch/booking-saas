const assert = require('assert');
const { normalizePhone } = require('../lib/phone');
const { pickCanonicalName, computeCustomerFlags, displayStatus, resolveReturnDays } = require('../lib/customers');

function testPhone() {
  assert.strictEqual(normalizePhone('054-123-4567').normalized, '0541234567');
  assert.strictEqual(normalizePhone('+972541234567').normalized, '0541234567');
  assert.strictEqual(normalizePhone('972541234567').valid, true);
  assert.strictEqual(normalizePhone('עכעכ').valid, false);
  assert.strictEqual(normalizePhone('עכעכ').normalized, null);
  assert.strictEqual(normalizePhone('').normalized, null);
  assert.strictEqual(normalizePhone('098123456789012').valid, false);
}

function testNames() {
  const hagit = pickCanonicalName([
    { customer_name: 'חגית', status: 'cancelled' },
    { customer_name: 'חגית דנינו', status: 'confirmed' },
    { customer_name: 'אמוש', status: 'confirmed' },
  ]);
  assert.strictEqual(hagit, 'חגית דנינו');

  const hallel = pickCanonicalName([
    { customer_name: 'הלל דנינו', status: 'confirmed' },
    { customer_name: 'הלל', status: 'cancelled' },
    { customer_name: 'אחותך המועדפת', status: 'confirmed' },
    { customer_name: 'Halel d', status: 'confirmed' },
  ]);
  assert.strictEqual(hallel, 'הלל דנינו');

  const noa = pickCanonicalName([
    { customer_name: 'נועה קניאור', status: 'cancelled' },
    { customer_name: 'נועה', status: 'cancelled' },
  ]);
  assert.strictEqual(noa, 'נועה קניאור');
}

function testStatus() {
  const now = Date.now();
  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();
  const due = computeCustomerFlags({
    visit_count: 4,
    last_visit: daysAgo(27),
    next_appointment: null,
    last_service: 'מבנה אנטומי',
  });
  assert.strictEqual(due.rebook_due, true);
  assert.strictEqual(due.inactive, false);
  assert.strictEqual(displayStatus(due), 'rebook_due');

  const inactive = computeCustomerFlags({
    visit_count: 3,
    last_visit: daysAgo(100),
    next_appointment: null,
    last_service: 'מבנה אנטומי',
  });
  assert.strictEqual(inactive.inactive, true);
  assert.strictEqual(displayStatus(inactive), 'inactive');

  const regular = computeCustomerFlags({
    visit_count: 3,
    last_visit: daysAgo(5),
    next_appointment: new Date(now + 86400000).toISOString(),
    last_service: 'מבנה אנטומי',
  });
  assert.strictEqual(regular.status, 'regular');
  assert.strictEqual(displayStatus(regular), 'regular');
}

function testReturnDays() {
  assert.deepStrictEqual(resolveReturnDays({ last_service: 'הרמת ריסים' }), { min: 42, max: 56 });
  assert.deepStrictEqual(resolveReturnDays({ last_service: 'הרמת גבות' }), { min: 42, max: 56 });
  assert.deepStrictEqual(resolveReturnDays({ last_service: 'עיצוב גבות' }), { min: 21, max: 28 });
  assert.deepStrictEqual(resolveReturnDays({ last_service: 'מבנה אנטומי' }), { min: 21, max: 28 });
  assert.deepStrictEqual(resolveReturnDays({ recommended_return_days_min: 30, recommended_return_days_max: 40 }), { min: 30, max: 40 });
}

testPhone();
testNames();
testStatus();
testReturnDays();
console.log('customers logic tests passed');
