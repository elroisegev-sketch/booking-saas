require('dotenv').config();
const db = require('../db');
const { applyCustomerSchema, backfillCustomers } = require('../lib/customerMigration');

(async () => {
  await applyCustomerSchema(db);
  const report = await backfillCustomers(db);
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
