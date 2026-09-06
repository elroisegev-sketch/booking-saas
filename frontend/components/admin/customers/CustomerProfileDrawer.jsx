import { useEffect, useState } from 'react';
import { fetchCustomer, updateCustomer } from '../../../lib/customersApi';
import CustomerHistory from './CustomerHistory';
import CustomerPreferences from './CustomerPreferences';
import {
  SOURCE_OPTIONS,
  cardStyle,
  daysAgoLabel,
  fieldStyle,
  fmtMoney,
  fmtShortDate,
  isValidPhone,
  sourceLabel,
  statusMeta,
  visitLabel,
  waLink,
} from './customerUtils';

export default function CustomerProfileDrawer({ customerId, onClose, onBook, onUpdated, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    fetchCustomer(customerId)
      .then((payload) => {
        setData(payload);
        const c = payload.customer;
        setForm({
          name: c.name || '',
          phone: c.phone || '',
          birthday: c.birthday ? String(c.birthday).slice(0, 10) : '',
          source: c.source || '',
          source_detail: c.source_detail || '',
          notes: c.notes || '',
          preferences: c.preferences || {},
          is_vip: !!c.is_vip,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'שגיאה בטעינת כרטיס הלקוחה');
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, [customerId]);

  const customer = data?.customer;
  const phoneOk = customer ? isValidPhone(customer.phone) : false;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateCustomer(customerId, form);
      setData((prev) => ({ ...prev, customer: { ...prev.customer, ...updated } }));
      setEditing(false);
      showToast('הכרטיס נשמר ✅');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      showToast(err.message || 'שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(161,23,56,0.22)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="customer-drawer"
        style={{
          position: 'absolute',
          background: 'rgba(255,248,250,0.97)',
          boxShadow: '0 -8px 40px rgba(161,23,56,0.16)',
          overflow: 'auto',
          fontFamily: 'Varela Round, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.1rem 0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#A11738' }}>כרטיס לקוחה</h2>
          <button type="button" onClick={onClose} aria-label="סגור" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', minWidth: 36, minHeight: 36 }}>✕</button>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '2rem', color: '#A11738', fontWeight: 700 }}>טוען...</p>}
        {error && !loading && (
          <div style={{ padding: '1.25rem' }}>
            <p style={{ color: '#991b1b', fontWeight: 700 }}>{error}</p>
            <button type="button" onClick={load} style={{ marginTop: '8px', border: 'none', background: '#F7C1C3', color: '#A11738', borderRadius: '10px', padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>נסי שוב</button>
          </div>
        )}

        {customer && !loading && (
          <div style={{ padding: '0 1.1rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#A11738' }}>{customer.name}</h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>{customer.phone || 'אין טלפון'}</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: statusMeta(customer.status).bg, color: statusMeta(customer.status).color, borderRadius: '999px', padding: '3px 8px' }}>{statusMeta(customer.status).label}</span>
                  {customer.is_vip && <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', borderRadius: '999px', padding: '3px 8px' }}>VIP</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <ActionButton
                disabled={!phoneOk}
                onClick={() => window.open(waLink(customer.phone, customer.rebook_due ? `היי ${customer.name} 🌸\nעבר קצת זמן מהטיפול האחרון 💕\nאשמח לשריין לך תור לחידוש 💅` : ''), '_blank')}
              >
                וואטסאפ
              </ActionButton>
              <ActionButton onClick={() => onBook(customer)}>קביעת תור</ActionButton>
              <ActionButton onClick={() => setEditing((v) => !v)}>{editing ? 'ביטול' : 'עריכה'}</ActionButton>
            </div>
            {!phoneOk && (
              <p style={{ margin: '-6px 0 12px', fontSize: '0.75rem', color: '#b45309' }}>אין מספר תקין — לא ניתן לפתוח וואטסאפ</p>
            )}

            <div style={{ ...cardStyle, padding: '0.85rem', marginBottom: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Metric label="ביקורים" value={visitLabel(customer.visit_count)} />
              <Metric label="סה״כ הכנסות" value={fmtMoney(customer.lifetime_value)} />
              <Metric label="ביקור אחרון" value={customer.last_visit ? `${fmtShortDate(customer.last_visit)}${customer.days_since_last != null ? ` • ${daysAgoLabel(customer.days_since_last)}` : ''}` : '—'} />
              <Metric label="תור הבא" value={customer.next_appointment ? fmtShortDate(customer.next_appointment) : 'אין'} />
            </div>

            {!editing ? (
              <div style={{ ...cardStyle, padding: '0.95rem', marginBottom: '0.85rem' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#A11738' }}>מידע קבוע</p>
                <Row label="יום הולדת" value={form?.birthday ? new Date(form.birthday).toLocaleDateString('he-IL') : 'לא צוין'} />
                <Row label="מקור הגעה" value={sourceLabel(customer.source) || 'לא צוין'} />
                {customer.source_detail && <Row label="פירוט" value={customer.source_detail} />}
                <Row label="הערות קבועות" value={customer.notes || 'אין'} />
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700 }}>העדפות</p>
                  <CustomerPreferences value={customer.preferences} readOnly />
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, padding: '0.95rem', marginBottom: '0.85rem' }}>
                <p style={{ margin: '0 0 10px', fontWeight: 800, color: '#A11738' }}>עריכת כרטיס</p>
                <Field label="שם" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="טלפון" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="יום הולדת" type="date" value={form.birthday} onChange={(v) => setForm({ ...form, birthday: v })} />
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>מקור הגעה</span>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={fieldStyle}>
                    <option value="">לא צוין</option>
                    {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <Field label="פירוט מקור / מי הפנתה" value={form.source_detail} onChange={(v) => setForm({ ...form, source_detail: v })} />
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>הערות קבועות</span>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
                </label>
                <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#A11738' }}>העדפות</p>
                <CustomerPreferences value={form.preferences} onChange={(preferences) => setForm({ ...form, preferences })} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0', fontWeight: 700, color: '#92400e' }}>
                  <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm({ ...form, is_vip: e.target.checked })} />
                  לקוחה VIP
                </label>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  style={{ width: '100%', minHeight: 44, border: 'none', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 800, cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}
                >
                  {saving ? 'שומרת...' : 'שמירה'}
                </button>
              </div>
            )}

            <div style={{ ...cardStyle, padding: '0.95rem' }}>
              <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#A11738' }}>היסטוריית טיפולים</p>
              <CustomerHistory history={data.history} />
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .customer-drawer {
          left: 0;
          right: 0;
          bottom: 0;
          top: auto;
          max-height: 92vh;
          border-radius: 24px 24px 0 0;
        }
        @media (min-width: 768px) {
          .customer-drawer {
            top: 0;
            bottom: 0;
            right: 0;
            left: auto;
            width: min(420px, 100vw);
            max-height: 100vh;
            border-radius: 24px 0 0 24px;
          }
        }
      `}</style>
    </div>
  );
}

function ActionButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        minHeight: 42,
        border: 'none',
        borderRadius: '12px',
        background: disabled ? '#e5e7eb' : 'rgba(255,255,255,0.85)',
        color: disabled ? '#9ca3af' : '#A11738',
        fontWeight: 800,
        fontSize: '0.78rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Varela Round, sans-serif',
        boxShadow: '0 2px 10px rgba(161,23,56,0.06)',
      }}
    >
      {children}
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ca3af', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: '3px 0 0', fontSize: '0.88rem', fontWeight: 800, color: '#A11738' }}>{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#374151' }}>{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label style={{ display: 'block', marginBottom: '10px' }}>
      <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} />
    </label>
  );
}
