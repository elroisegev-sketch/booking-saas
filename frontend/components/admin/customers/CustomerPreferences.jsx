import { fieldStyle } from './customerUtils';

const FIELDS = [
  { key: 'nail_style', label: 'סגנון מועדף' },
  { key: 'nail_shape', label: 'צורה מועדפת' },
  { key: 'favorite_colors', label: 'צבעים אהובים' },
  { key: 'remember', label: 'דברים שחשוב לזכור' },
];

export default function CustomerPreferences({ value, onChange, readOnly }) {
  const prefs = value || {};
  if (readOnly) {
    const filled = FIELDS.filter((f) => prefs[f.key]);
    if (!filled.length) return <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.82rem' }}>אין העדפות שמורות</p>;
    return (
      <div style={{ display: 'grid', gap: '8px' }}>
        {filled.map((f) => (
          <div key={f.key}>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700 }}>{f.label}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#374151' }}>{prefs[f.key]}</p>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {FIELDS.map((f) => (
        <label key={f.key} style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>{f.label}</span>
          {f.key === 'remember' ? (
            <textarea
              value={prefs[f.key] || ''}
              onChange={(e) => onChange({ ...prefs, [f.key]: e.target.value })}
              rows={3}
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '72px' }}
            />
          ) : (
            <input
              value={prefs[f.key] || ''}
              onChange={(e) => onChange({ ...prefs, [f.key]: e.target.value })}
              style={fieldStyle}
            />
          )}
        </label>
      ))}
    </div>
  );
}
