import { FILTERS } from './customerUtils';

export default function CustomerFilters({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', marginBottom: '0.85rem', WebkitOverflowScrolling: 'touch' }}>
      {FILTERS.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            style={{
              flexShrink: 0,
              minHeight: '36px',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              border: active ? 'none' : '1px solid rgba(247,193,195,0.55)',
              background: active ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'rgba(255,255,255,0.75)',
              color: active ? 'white' : '#A11738',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'Varela Round, sans-serif',
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
