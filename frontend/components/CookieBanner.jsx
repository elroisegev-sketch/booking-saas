import { useState, useEffect } from 'react';

const COOKIE_KEY = 'cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem(COOKIE_KEY, 'accepted'); setVisible(false); };
  const reject = () => { localStorage.setItem(COOKIE_KEY, 'rejected'); setVisible(false); };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="הסכמה לשימוש בעוגיות"
      dir="rtl"
      style={{
        position: 'fixed', bottom: 0, right: 0, left: 0, zIndex: 9999,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(247,193,195,0.5)',
        boxShadow: '0 -8px 32px rgba(161,23,56,0.10)',
        padding: '1rem 1.25rem',
        fontFamily: "'Heebo', 'Arial', sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>
          אנחנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה שלך.{' '}
          <a href="/privacy" style={{ color: '#A11738', fontWeight: 700, textDecoration: 'underline' }}>
            למדיניות הפרטיות
          </a>
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button
            onClick={accept}
            aria-label="קבל את כל העוגיות"
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '999px',
              background: 'linear-gradient(135deg,#A11738,#EC6A83)',
              color: 'white', fontWeight: 700, fontSize: '0.875rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(161,23,56,0.28)',
              fontFamily: 'inherit',
            }}
          >
            קבל הכל
          </button>
          <button
            onClick={reject}
            aria-label="דחה עוגיות לא חיוניות"
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '999px',
              background: 'white', border: '1.5px solid rgba(247,193,195,0.7)',
              color: '#A11738', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            דחה
          </button>
        </div>
      </div>
    </div>
  );
}
