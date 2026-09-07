-- Persisted SMS appointment reminders. Additive and safe to re-run.
-- Does not alter appointments rows, statuses, or the double-booking constraint.

CREATE TABLE IF NOT EXISTS sms_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dedup_key VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(50),
  message TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  provider_response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_reminders_due
  ON sms_reminders (status, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_sms_reminders_appointment
  ON sms_reminders (appointment_id);
