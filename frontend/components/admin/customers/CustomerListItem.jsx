import { cardStyle, daysAgoLabel, fmtMoney, fmtShortDate, statusMeta, visitLabel } from './customerUtils';

export default function CustomerListItem({ customer, onClick }) {
  const meta = statusMeta(customer.status);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...cardStyle,
        width: '100%',
        textAlign: 'right',
        padding: '0.95rem 1rem',
        marginBottom: '8px',
        cursor: 'pointer',
        fontFamily: 'Varela Round, sans-serif',
        border: '1px solid rgba(255,255,255,0.8)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#A11738' }}>{customer.name}</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>
            {customer.last_service || 'אין טיפול אחרון'}
            {customer.days_since_last != null ? ` • ${daysAgoLabel(customer.days_since_last)}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
          {customer.is_vip && (
            <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#fef3c7', color: '#92400e', borderRadius: '999px', padding: '2px 7px' }}>VIP</span>
          )}
          <span style={{ fontSize: '0.65rem', fontWeight: 700, background: meta.bg, color: meta.color, borderRadius: '999px', padding: '2px 7px' }}>{meta.label}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
        <span style={{ fontSize: '0.78rem', color: '#374151', fontWeight: 600 }}>
          {visitLabel(customer.visit_count)} • {fmtMoney(customer.lifetime_value)}
        </span>
        <span style={{ fontSize: '0.75rem', color: customer.next_appointment ? '#A11738' : '#9ca3af', fontWeight: 700 }}>
          {customer.next_appointment ? `תור הבא: ${fmtShortDate(customer.next_appointment)}` : 'אין תור הבא'}
        </span>
      </div>
    </button>
  );
}
