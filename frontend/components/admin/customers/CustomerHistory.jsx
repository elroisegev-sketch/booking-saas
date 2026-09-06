import { fmtMoney } from './customerUtils';

const STATUS_HE = {
  pending: 'ממתין',
  confirmed: 'מאושר',
  cancelled: 'בוטל',
  completed: 'הושלם',
};

export default function CustomerHistory({ history }) {
  if (!history || history.length === 0) {
    return <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>אין היסטוריית טיפולים</p>;
  }
  return (
    <div>
      {history.map((item) => {
        const cancelled = item.status === 'cancelled';
        return (
          <div
            key={item.id}
            style={{
              padding: '0.8rem 0',
              borderBottom: '1px solid rgba(247,193,195,0.28)',
              opacity: cancelled ? 0.55 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontWeight: 800, color: '#A11738', fontSize: '0.88rem' }}>
                {new Date(item.appointment_time).toLocaleDateString('he-IL')}
              </span>
              <span style={{ fontWeight: 800, color: '#EC6A83', fontSize: '0.88rem' }}>{fmtMoney(item.price)}</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#374151', fontWeight: 600 }}>{item.service_name}</p>
            {item.status && item.status !== 'confirmed' && (
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: cancelled ? '#991b1b' : '#6b7280' }}>{STATUS_HE[item.status] || item.status}</p>
            )}
            {item.notes && (
              <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>“{item.notes}”</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
