-- Additive CRM migration. Safe to re-run.
-- Does not drop appointments, customer columns, or the calendar exclusion constraint.

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  phone_normalized VARCHAR(20),
  email VARCHAR(255),
  birthday DATE,
  source VARCHAR(40),
  source_detail VARCHAR(255),
  notes TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  is_vip BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS customers_business_phone_normalized_uidx
  ON customers (business_id, phone_normalized)
  WHERE phone_normalized IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_business_name
  ON customers (business_id, name);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_customer_time
  ON appointments (customer_id, appointment_time);

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS recommended_return_days_min INTEGER;

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS recommended_return_days_max INTEGER;
