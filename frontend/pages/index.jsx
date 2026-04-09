import { useState, useRef, useEffect } from 'react';

const MOCK_USER = { id: '1', email: 'lior@beauty.com', business_name: 'ליאור שגב – היופי שלך', slug: 'lior-segev' };

const MOCK_SERVICES = [
  { id: 's1', name: 'מבנה אנטומי', duration: 60, price: 140, is_active: true, category: "לק ג'ל 💅" },
  { id: 's2', name: 'בניה חדשה', duration: 75, price: 250, is_active: true, category: "לק ג'ל 💅" },
  { id: 's3', name: 'הסרה + מניקור + צורה', duration: 45, price: 70, is_active: true, category: "לק ג'ל 💅" },
  { id: 's4', name: 'השלמת ציפורן', duration: 15, price: 10, is_active: true, category: "לק ג'ל 💅" },
  { id: 's5', name: "פרנץ'", duration: 15, price: 20, is_active: true, category: "לק ג'ל 💅" },
  { id: 's15', name: 'קישוט', duration: 30, price: 0, is_active: true, category: "לק ג'ל 💅" },
  { id: 's6', name: 'עיצוב גבות', duration: 20, price: 70, is_active: true, category: 'פנים 💆' },
  { id: 's7', name: 'צביעת גבות', duration: 15, price: 20, is_active: true, category: 'פנים 💆' },
  { id: 's8', name: 'עיצוב + צביעת גבות', duration: 30, price: 80, is_active: true, category: 'פנים 💆' },
  { id: 's9', name: 'הרמת ריסים', duration: 60, price: 200, is_active: true, category: 'פנים 💆' },
  { id: 's10', name: 'הרמת גבות', duration: 60, price: 200, is_active: true, category: 'פנים 💆' },
  { id: 's11', name: 'שפם', duration: 10, price: 20, is_active: true, category: 'פנים 💆' },
  { id: 's12', name: 'פאות', duration: 15, price: 40, is_active: true, category: 'פנים 💆' },
  { id: 's13', name: 'סנטר', duration: 10, price: 30, is_active: true, category: 'פנים 💆' },
  { id: 's14', name: 'אף', duration: 10, price: 30, is_active: true, category: 'פנים 💆' },
];

const MOCK_AVAILABILITY = [
  { day_of_week: 0, is_active: true, start_time: '10:00', end_time: '17:00' },
  { day_of_week: 1, is_active: true, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 2, is_active: true, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 3, is_active: true, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 4, is_active: true, start_time: '09:00', end_time: '18:00' },
  { day_of_week: 5, is_active: false, start_time: '09:00', end_time: '14:00' },
  { day_of_week: 6, is_active: false, start_time: '09:00', end_time: '14:00' },
];

const PORTFOLIO = [
  { id: 1, title: "לק ג'ל פרנץ'", emoji: '💅', desc: 'עיצוב קלאסי ומרהיב' },
  { id: 2, title: 'מבנה אנטומי', emoji: '✨', desc: 'בנייה מקצועית וטבעית' },
  { id: 3, title: 'הרמת ריסים', emoji: '👁', desc: 'מראה פתוח ורענן' },
  { id: 4, title: 'עיצוב גבות', emoji: '🌿', desc: 'גבות מושלמות לפנים שלך' },
];

const TERMS_GEL = `✨ הפרטים הקטנים שעושים את כל ההבדל ✨

כדי שאוכל להעניק לך את השירות הכי מדויק ונעים, אשמח שתאשרי את התקנון:

💅🏽 עיצוב מיוחד (ציורים, פרנץ', דוגמאות וכו') – תעדכני על עיצוב לפני התור כדי שאוכל לקבוע לנו תור מיוחד, עדכון בזמן התור זה על בסיס מקום פנוי 🎀

💅🏽 שמירת תור ביומן מתבצעת ע״י העברת מקדמה של כ-50% מעלות הטיפול דרך ביט/פייבוקס 🎀

💅🏽 במקרה של ביטול פחות מ-24 שעות לפני התור, המקדמה לא תוחזר מאחר והזמן כבר נשמר עבורך 🎀

💅🏽 התשלום מתבצע בסיום הטיפול בפייבוקס / ביט 🎀

💅🏽 הסרת עבודה קיימת ממקום אחר כרוכה בתוספת של 10₪ 🎀

מחכה כבר לפגוש אותך 🥰
ליאור שגב, היופי שלך 🎀`;

const TERMS_GENERAL = `תקנון כללי – ליאור שגב יופי

1. ביטול תור יש לבצע לפחות 24 שעות מראש.
2. איחור של מעל 15 דקות עלול לגרום לביטול התור.
3. מקדמה נדרשת לאישור התור ואינה ניתנת להחזר במקרה של ביטול קצר מועד.
4. הלקוחה אחראית לציין רגישויות עור לפני הטיפול.

בקביעת התור את מאשרת שקראת והסכמת לתקנון זה.`;

const LIOR_PHONE = '0535249688';
const PAYBOX_LINK = `https://payboxapp.page.link/pay?to=${LIOR_PHONE}`;
const WHATSAPP_LINK = (name, services, date, time, total) =>
  `https://wa.me/972${LIOR_PHONE.slice(1)}?text=${encodeURIComponent(`היי ליאור 🌸\nקבעתי תור!\nשם: ${name}\nשירותים: ${services}\nתאריך: ${date} בשעה ${time}\nסה״כ: ₪${total}\nמקדמה לשריין: ₪${Math.ceil(total/2)}\nמחכה לאישורך 💅`)}`;

const fmtTime = (iso) => new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (iso) => new Date(iso).toLocaleDateString('he-IL', { weekday: 'short', month: 'short', day: 'numeric' });
const fmtPrice = (n) => parseFloat(n || 0) === 0 ? 'משתנה' : `₪${parseFloat(n).toFixed(0)}`;

const Icon = ({ name, className = 'w-5 h-5' }) => {
  const icons = {
    calendar: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
    users: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    sparkles: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
    clock: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    check: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>,
    x: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>,
    plus: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>,
    edit: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
    trash: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
    home: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
    chevronL: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>,
    chevronR: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>,
    link: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>,
    logout: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,
    image: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
    whatsapp: <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    portfolio: <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  };
  return icons[name] || null;
};

// ── AUTH ──────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await fetch('https://booking-saas-production-b9fd.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'lior@beauty.com', password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError('סיסמה שגויה');
      }
    } catch(e) {
      setError('שגיאת חיבור');
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Varela Round, sans-serif', background: 'linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%)' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 16px 48px rgba(161,23,56,0.1), inset 0 1px 0 rgba(255,255,255,1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo-pink.png" alt="Lior Segev" style={{ height: '60px', objectFit: 'contain', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A11738', margin: 0 }}>כניסה לניהול 🎀</h2>
          </div>
          <form onSubmit={handle}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>סיסמה</label>
              <input type="password" style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '16px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.875rem', direction: 'ltr', boxSizing: 'border-box', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', borderRadius: '999px', background: loading ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(161,23,56,0.32)' }}>
              {loading ? 'רגע...' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
// ── TERMS SCREEN ──────────────────────────────────────────────
const TermsScreen = ({ termsText, onAccept, onBack, externalNail, onExternalNailChange }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleAccept = () => {
    if (onExternalNailChange && externalNail === null) {
      setShowPopup(true);
      return;
    }
    onAccept();
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%)', fontFamily: 'Varela Round, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <div style={{ background: 'linear-gradient(135deg,#A11738,#EC6A83)', padding: '1.5rem', textAlign: 'center', color: 'white', borderRadius: '28px 28px 0 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
            <h2 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>תקנון</h2>
            <p style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '4px' }}>יש לקרוא ולאשר לפני קביעת התור</p>
          </div>
          <div style={{ padding: '1.5rem', maxHeight: '320px', overflowY: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, fontFamily: 'Varela Round, sans-serif' }}>{termsText}</pre>
          </div>

          {onExternalNailChange && (
            <div style={{ padding: '0 1.5rem 1.25rem' }}>
              <div style={{ background: 'rgba(247,193,195,0.2)', border: '1.5px solid rgba(247,193,195,0.5)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151', margin: '0 0 0.75rem' }}>
                  האם יש לך לק קיים מסלון אחר?
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#A11738', fontWeight: 400, marginTop: '2px' }}>הסרה ממקום אחר כרוכה בתוספת של 10 ₪</span>
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => onExternalNailChange(true)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '999px', border: `2px solid ${externalNail === true ? '#A11738' : 'rgba(247,193,195,0.5)'}`, background: externalNail === true ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', color: externalNail === true ? 'white' : '#374151', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Varela Round, sans-serif' }}>
                    כן, יש לי (+10 ₪)
                  </button>
                  <button onClick={() => onExternalNailChange(false)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '999px', border: `2px solid ${externalNail === false ? '#A11738' : 'rgba(247,193,195,0.5)'}`, background: externalNail === false ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', color: externalNail === false ? 'white' : '#374151', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Varela Round, sans-serif' }}>
                    לא, אין לי
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(247,193,195,0.2)', display: 'flex', gap: '12px' }}>
            <button onClick={onBack} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#374151', fontWeight: 700, cursor: 'pointer' }}>חזרה</button>
            <button onClick={handleAccept} style={{ flex: 2, padding: '0.875rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(161,23,56,0.32)' }}>
              קראתי ומאשרת ✅
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1.5rem' }}>
          <div dir="rtl" style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '320px', width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💅</div>
            <h3 style={{ fontWeight: 900, color: '#A11738', marginBottom: '0.5rem', fontFamily: 'Varela Round, sans-serif' }}>רגע לפני שממשיכים</h3>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, marginBottom: '1.25rem', fontFamily: 'Varela Round, sans-serif' }}>
              שכחת לענות — האם יש לך לק קיים מסלון אחר?<br />
              <span style={{ color: '#A11738', fontWeight: 700 }}>הסרה ממקום אחר כרוכה בתוספת של 10 ₪</span>
            </p>
            <button onClick={() => setShowPopup(false)}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>
              חזרה לבחירה
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── BOOKING PAGE ──────────────────────────────────────────────
const BOOKING_KEY = 'lior_booking_state';

const BookingPage = ({ onBack, onAppointmentBooked }) => {
  // steps: 0=terms, 1=services, 2=date, 3=time, 4=details, 5=payment
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [externalNail, setExternalNail] = useState(null);
  const [sel, setSel] = useState({ date: null, time: null, name: '', phone: '', image: null });
  const [calMonth, setCalMonth] = useState(new Date());
  const [booked, setBooked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const skipFirstSaveRef = useRef(true);
  const [realServices, setRealServices] = useState([]);
  const [realAvailability, setRealAvailability] = useState(null);
  const [nailCountModal, setNailCountModal] = useState(false);
  const [nailService, setNailService] = useState(null);
  const [showWaBubble, setShowWaBubble] = useState(true);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(BOOKING_KEY);
      if (saved) {
        const s = JSON.parse(saved);
        if (s.step) setStep(s.step);
        if (s.selectedServices) setSelectedServices(s.selectedServices);
        if (s.sel) setSel({ ...s.sel, date: s.sel.date ? new Date(s.sel.date) : null });
        if (s.calMonth) setCalMonth(new Date(s.calMonth));
      }
    } catch(e) {}
  }, []);

  // Save state to sessionStorage on every change (skip first run — restore hasn't applied yet)
  useEffect(() => {
    if (skipFirstSaveRef.current) { skipFirstSaveRef.current = false; return; }
    try {
      sessionStorage.setItem(BOOKING_KEY, JSON.stringify({
        step,
        selectedServices,
        sel: { ...sel, date: sel.date ? sel.date.toISOString() : null },
        calMonth: calMonth.toISOString(),
      }));
    } catch(e) {}
  }, [step, selectedServices, sel, calMonth]);

  const clearAndBack = () => {
    sessionStorage.removeItem(BOOKING_KEY);
    onBack();
  };

  useEffect(() => {
    fetch('https://booking-saas-production-b9fd.up.railway.app/api/services/public/lior-segev')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRealServices(data); else if (data.services) setRealServices(data.services); })
      .catch(() => {});
    fetch('https://booking-saas-production-b9fd.up.railway.app/api/availability/public/lior-segev')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setRealAvailability(data); })
      .catch(() => {});
  }, []);

  const displayServices = (realServices.length > 0 ? realServices : MOCK_SERVICES)
    .map(s => ({ ...s, category: s.category || "לק ג'ל 💅" }));

  const hasGel = selectedServices.some(s => s.category && s.category.includes("לק ג'ל"));
  const totalPrice = selectedServices.reduce((s, svc) => s + parseFloat(svc.price || 0), 0);
  const totalDuration = selectedServices.reduce((s, svc) => s + svc.duration, 0);

  // Determine which terms to show
  const termsText = hasGel ? TERMS_GEL : TERMS_GENERAL;

  const toggleService = (svc) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === svc.id)
        ? prev.filter(s => s.id !== svc.id)
        : [...prev, svc]
    );
  };

  const getDIM = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFD = (y, m) => new Date(y, m, 1).getDay();

  const isAvail = (date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    const dow = date.getDay();
    // public endpoint מחזיר רק ימים פעילים — אם קיים, הוא פעיל
    // אם הנתונים טרם נטענו (null) — fallback למוק. אם נטענו ריק — לא עובדת אף יום
    if (realAvailability !== null) {
      return !!realAvailability.find(x => x.day_of_week === dow);
    }
    const a = MOCK_AVAILABILITY.find(x => x.day_of_week === dow);
    return !!(a && a.is_active);
  };

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!sel.date || selectedServices.length === 0) { setAvailableSlots([]); return; }
    const firstService = selectedServices[0];
    const dateStr = `${sel.date.getFullYear()}-${String(sel.date.getMonth()+1).padStart(2,'0')}-${String(sel.date.getDate()).padStart(2,'0')}`;
    setLoadingSlots(true);
    fetch(`https://booking-saas-production-b9fd.up.railway.app/api/appointments/slots/lior-segev/${firstService.id}/${dateStr}?totalDuration=${totalDuration}`)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setAvailableSlots(Array.isArray(data.slots) ? data.slots : []);
        setLoadingSlots(false);
      })
      .catch(function() { setAvailableSlots([]); setLoadingSlots(false); });
  }, [sel.date, selectedServices.length, totalDuration]);

  const slots = () => availableSlots;

  const CAT_ORDER = ["לק ג'ל 💅", 'פנים 💆'];
  const allCats = [...new Set(displayServices.map(s => s.category))];
  const cats = [...CAT_ORDER.filter(c => allCats.includes(c)), ...allCats.filter(c => !CAT_ORDER.includes(c))];
  const S = { fontFamily: 'Varela Round, sans-serif' };
  const btn = (active) => ({ padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', border: `2px solid ${active ? '#EC6A83' : '#f0f0f0'}`, background: active ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', color: active ? 'white' : '#A11738', cursor: 'pointer' });

  const dateStr = sel.date ? sel.date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const serviceNames = selectedServices.map(s => s.name).join(', ');
  const finalPrice = totalPrice + (externalNail && hasGel ? 10 : 0);
  const deposit = Math.ceil(finalPrice / 2);
  const waLink = WHATSAPP_LINK(sel.name, serviceNames + (externalNail && hasGel ? ' + הסרת לק מסלון אחר' : ''), dateStr, sel.time, finalPrice);

  useEffect(() => { if (booked) { sessionStorage.removeItem(BOOKING_KEY); onBack(); } }, [booked]);

  if (step === 0) setStep(1);

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%)', fontFamily: "'Varela Round', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.7)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={clearAndBack} style={{ padding: '0.5rem 0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', cursor: 'pointer', color: '#A11738', display: 'flex' }}>
          <Icon name="chevronR" className="w-5 h-5" />
        </button>
        <img src="/symbol.png" alt="LS" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 400, color: '#A11738', margin: 0, fontSize: '1rem',}}>ליאור שגב</p>
          <p style={{ color: '#9ca3af', fontSize: '0.65rem', margin: 0, letterSpacing: '0.06em' }}>קביעת תור</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ width: (typeof step === 'number' && step >= s) ? '20px' : '6px', height: '6px', borderRadius: '999px', background: (typeof step === 'number' && step >= s) ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'rgba(247,193,195,0.45)', transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} />
          ))}
        </div>
      </div>

      {/* כפתור וואטסאפ צף — תמונת ליאור + בועת ענן */}
      <div style={{ position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', direction: 'ltr' }}>
        {/* בועת ענן */}
        {showWaBubble && (
          <div style={{
            position: 'relative',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(37,211,102,0.25)',
            borderRadius: '14px',
            padding: '0.45rem 0.75rem 0.45rem 1.8rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            whiteSpace: 'nowrap',
            animation: 'fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
          }}>
            <button onClick={() => setShowWaBubble(false)} style={{
              position: 'absolute', top: '50%', left: '6px', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', fontSize: '0.65rem', lineHeight: 1, padding: '2px',
            }}>✕</button>
            <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: '#111827', fontFamily: 'Varela Round, sans-serif', direction: 'rtl' }}>
              שאלה? דברי עם ליאור 💬
            </p>
            {/* זנב */}
            <div style={{
              position: 'absolute', bottom: '-7px', left: '20px',
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid rgba(255,255,255,0.97)',
            }} />
          </div>
        )}
        {/* כפתור עיגול */}
        <a href={`https://wa.me/972${LIOR_PHONE.slice(1)}?text=${encodeURIComponent('היי ליאור 🌸 אני צריכה עזרה עם קביעת התור')}`}
          target="_blank" rel="noreferrer"
          onClick={() => setShowWaBubble(false)}
          style={{ width: '58px', height: '58px', borderRadius: '50%', background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.5)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'white', display: 'flex' }}><Icon name="whatsapp" className="w-8 h-8" /></span>
        </a>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Step 1 - Services */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.2rem' }}>בחרי שירותים</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.75rem' }}>ניתן לבחור מספר שירותים</p>
            {cats.map(cat => (
              <div key={cat} style={{ marginBottom: '1.5rem' }}>
                <p style={{ display: 'inline-flex', fontWeight: 500, color: '#A11738', fontSize: '0.78rem', letterSpacing: '0.08em', marginBottom: '0.75rem', background: 'rgba(247,193,195,0.3)', backdropFilter: 'blur(8px)', padding: '3px 12px', borderRadius: '999px', border: '1px solid rgba(247,193,195,0.3)' }}>{cat}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {displayServices.filter(s => s.category === cat).map(svc => {
                    const isSelected = selectedServices.find(s => s.id === svc.id);
                    return (
                      <button key={svc.id} className="svc-card" onClick={() => { if (svc.name === 'השלמת ציפורן') { setNailService(svc); setNailCountModal(true); } else { toggleService(svc); } }}
                        style={{ background: isSelected ? 'rgba(252,231,243,0.7)' : 'rgba(255,255,255,0.6)', border: `1.5px solid ${isSelected ? 'rgba(236,106,131,0.6)' : 'rgba(255,255,255,0.8)'}`, borderRadius: '20px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'right', boxShadow: isSelected ? '0 4px 20px rgba(236,106,131,0.16), inset 0 1px 0 rgba(255,255,255,0.9)' : '0 4px 20px rgba(161,23,56,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${isSelected ? 'transparent' : 'rgba(247,193,195,0.55)'}`, background: isSelected ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isSelected ? '0 2px 8px rgba(161,23,56,0.22)' : 'none' }}>
                            {isSelected && <svg width="10" height="8" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>{svc.name}</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.7rem', margin: '2px 0 0' }}>{svc.duration} דקות</p>
                          </div>
                        </div>
                        <span style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 400, fontSize: '1.2rem', color: '#A11738', flexShrink: 0 }}>{fmtPrice(svc.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {nailCountModal && nailService && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(161,23,56,0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <div dir="rtl" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '28px', padding: '1.75rem', width: '100%', maxWidth: '340px', margin: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)', animation: 'scaleIn 0.3s cubic-bezier(0.22,1,0.36,1)' }}>
                  <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 300, color: '#3d0c16', fontSize: '1.5rem', marginBottom: '0.4rem' }}>כמה ציפורניים? 💅</h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginBottom: '1.25rem' }}>כל השלמה = ₪10</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '1rem' }}>
                    {[1,2,3,4].map(n => (
                      <button key={n} className="lux-btn" onClick={() => { const updated = { ...nailService, name: `השלמת ציפורן (${n})`, price: n * 10, duration: n * 15 }; setSelectedServices(prev => [...prev.filter(s => !s.name.startsWith('השלמת ציפורן')), updated]); setNailCountModal(false); }}
                        style={{ padding: '0.875rem', borderRadius: '16px', background: 'rgba(253,236,229,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(247,193,195,0.5)', fontWeight: 700, color: '#A11738', fontSize: '0.9rem', cursor: 'pointer' }}>
                        {n === 1 ? 'ציפורן אחת' : `${n} ציפורניים`}<br/>
                        <span style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '1rem', color: '#EC6A83',}}>₪{n * 10}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setNailCountModal(false); alert('💅 לידיעתך\nמעל 4 השלמות עדיף לקצר את כל הציפורניים או לעשות בנייה חדשה\n\nצרי קשר עם ליאור לתיאום 😊'); }} style={{ width: '100%', padding: '0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.65)', color: '#A11738', fontWeight: 600, cursor: 'pointer', marginBottom: '8px', fontSize: '0.875rem' }}>יש לי יותר מ-4 השלמות</button>
                  <button onClick={() => setNailCountModal(false)} style={{ width: '100%', padding: '0.5rem', borderRadius: '999px', background: 'none', color: '#9ca3af', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>ביטול</button>
                </div>
              </div>
            )}

            {selectedServices.length > 0 && (
              <div style={{ position: 'sticky', bottom: '1rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '1rem 1.25rem', marginTop: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.14), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, color: '#A11738', fontSize: '0.8rem' }}>{selectedServices.length} שירות{selectedServices.length > 1 ? 'ים' : ''} נבחר{selectedServices.length > 1 ? 'ו' : ''}</span>
                  <span style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 400, fontSize: '1.3rem', color: '#EC6A83',}}>סה"כ: {fmtPrice(externalNail && hasGel ? totalPrice + 10 : totalPrice)}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '10px' }}>{selectedServices.map(s => s.name).join(' + ')} · {totalDuration} דקות</div>
                <button className="lux-btn" onClick={() => { const hasKishut = selectedServices.some(s => s.name === 'קישוט'); if (hasKishut) { setStep('kishut_info'); } else if (hasGel) { setStep('terms_gel'); } else { setStep(2); } }}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(161,23,56,0.28)', letterSpacing: '0.04em', fontSize: '0.875rem' }}>
                  המשך לבחירת תאריך →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Kishut info */}
        {step === 'kishut_info' && (
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.75rem' }}>בחרת קישוט</h2>
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '20px', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'right', fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              כדי לדייק את הזמן והמחיר עבורך, מומלץ לשלוח תמונת השראה לליאור בוואטסאפ לפני האישור הסופי.<br /><br />
              ניתן להמשיך לקביעת התור גם ללא תמונה — ליאור תיצור איתך קשר לאישור הפרטים הסופיים.
            </div>
            <a href={`https://wa.me/972${LIOR_PHONE.slice(1)}?text=${encodeURIComponent('היי ליאור 🌸 אשמח לשלוח תמונת השראה לקישוט 💅')}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '0.875rem', borderRadius: '999px', background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', marginBottom: '12px', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(37,211,102,0.28)' }}>
              <Icon name="whatsapp" className="w-5 h-5" /> שלחי תמונה לליאור בוואטסאפ
            </a>
            <button className="lux-btn" onClick={() => { hasGel ? setStep('terms_gel') : setStep(2); }}
              style={{ width: '100%', padding: '0.875rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 16px rgba(161,23,56,0.28)' }}>
              המשך לקביעת תור →
            </button>
            <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#A11738', fontWeight: 500, cursor: 'pointer' }}>חזרה</button>
          </div>
        )}

        {step === 'terms_gel' && (
          <TermsScreen termsText={TERMS_GEL} onAccept={() => setStep(2)} onBack={() => setStep(1)}
            externalNail={externalNail} onExternalNailChange={setExternalNail} />
        )}

        {/* Step 2 - Date */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.2rem' }}>בחרי תאריך</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.75rem' }}>{selectedServices.map(s => s.name).join(' + ')}</p>
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', overflow: 'hidden', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(247,193,195,0.18)' }}>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#A11738' }}><Icon name="chevronR" className="w-4 h-4" /></button>
                <span style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 400, color: '#A11738', fontSize: '1.1rem',}}>{calMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#A11738' }}><Icon name="chevronL" className="w-4 h-4" /></button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '8px' }}>
                  {['א','ב','ג','ד','ה','ו','ש'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#d1b5bb', padding: '4px' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                  {Array.from({ length: getFD(calMonth.getFullYear(), calMonth.getMonth()) }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: getDIM(calMonth.getFullYear(), calMonth.getMonth()) }, (_, i) => {
                    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), i + 1);
                    const av = isAvail(d);
                    const isSel = sel.date && d.toDateString() === sel.date.toDateString();
                    return (
                      <button key={i} onClick={() => av && setSel({ ...sel, date: d })} disabled={!av}
                        style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: av ? 'pointer' : 'not-allowed', background: isSel ? 'linear-gradient(135deg,#A11738,#EC6A83)' : av ? 'rgba(253,236,229,0.6)' : 'transparent', color: isSel ? 'white' : av ? '#A11738' : '#e5c0c8', transition: 'transform 0.15s' }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#A11738', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>חזרה</button>
              <button className="lux-btn" onClick={() => sel.date && setStep(3)} disabled={!sel.date} style={{ flex: 2, padding: '0.875rem', borderRadius: '999px', background: sel.date ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'rgba(209,213,219,0.5)', color: sel.date ? 'white' : '#9ca3af', fontWeight: 600, border: 'none', cursor: sel.date ? 'pointer' : 'not-allowed', boxShadow: sel.date ? '0 4px 16px rgba(161,23,56,0.25)' : 'none' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 3 - Time */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.2rem' }}>בחרי שעה</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.75rem' }}>{sel.date ? sel.date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}</p>
            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2.5px solid rgba(236,106,131,0.2)', borderTopColor: '#EC6A83', margin: '0 auto 0.75rem', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>טוענת שעות פנויות...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '1.5rem' }}>
                {slots().map(s => (
                  <button key={s} className="slot-btn" onClick={() => setSel({ ...sel, time: s })}
                    style={{ padding: '0.875rem 0.5rem', borderRadius: '999px', fontWeight: 600, fontSize: '0.875rem', border: `1.5px solid ${sel.time === s ? 'transparent' : 'rgba(247,193,195,0.38)'}`, background: sel.time === s ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', color: sel.time === s ? 'white' : '#A11738', cursor: 'pointer', boxShadow: sel.time === s ? '0 4px 16px rgba(161,23,56,0.25)' : '0 1px 4px rgba(0,0,0,0.04)' }}>{s}</button>
                ))}
                {slots().length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: '2rem', fontSize: '0.875rem' }}>אין שעות פנויות ביום זה</p>}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#A11738', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>חזרה</button>
              <button className="lux-btn" onClick={() => sel.time && setStep(4)} disabled={!sel.time} style={{ flex: 2, padding: '0.875rem', borderRadius: '999px', background: sel.time ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'rgba(209,213,219,0.5)', color: sel.time ? 'white' : '#9ca3af', fontWeight: 600, border: 'none', cursor: sel.time ? 'pointer' : 'not-allowed', boxShadow: sel.time ? '0 4px 16px rgba(161,23,56,0.25)' : 'none' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 4 - Details */}
        {step === 4 && (
          <div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.2rem' }}>פרטים אישיים</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.75rem' }}>עוד צעד קטן 🌸</p>
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 500, fontSize: '0.72rem', color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>שם מלא</label>
                <input style={{ width: '100%', padding: '0.5rem 0', border: 'none', borderBottom: `1.5px solid ${sel.name ? '#EC6A83' : 'rgba(247,193,195,0.55)'}`, outline: 'none', fontSize: '0.95rem', direction: 'rtl', boxSizing: 'border-box', background: 'transparent', color: '#2d0a1e', transition: 'border-color 0.2s' }}
                  placeholder="שם מלא" value={sel.name} onChange={e => setSel({ ...sel, name: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 500, fontSize: '0.72rem', color: '#9ca3af', marginBottom: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>מספר טלפון</label>
                <input style={{ width: '100%', padding: '0.5rem 0', border: 'none', borderBottom: `1.5px solid ${sel.phone ? '#EC6A83' : 'rgba(247,193,195,0.55)'}`, outline: 'none', fontSize: '0.95rem', direction: 'ltr', boxSizing: 'border-box', textAlign: 'right', background: 'transparent', color: '#2d0a1e', transition: 'border-color 0.2s' }}
                  placeholder="050-0000000" value={sel.phone} onChange={e => setSel({ ...sel, phone: e.target.value })} />
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '1.25rem', marginBottom: '1.25rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              <p style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 400, color: '#A11738', fontSize: '1rem', marginBottom: '0.875rem' }}>סיכום הזמנה</p>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#374151', fontSize: '0.85rem' }}>{svc.name}</span>
                  <span style={{ color: '#EC6A83', fontWeight: 600, fontSize: '0.85rem' }}>{fmtPrice(svc.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(247,193,195,0.22)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#A11738', fontSize: '0.85rem' }}>סה"כ</span>
                <span style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 300, fontSize: '1.5rem', color: '#EC6A83',}}>{fmtPrice(totalPrice)}</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '6px' }}>{dateStr} · {sel.time} · {totalDuration} דקות</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#A11738', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>חזרה</button>
              <button className="lux-btn" onClick={() => (sel.name && sel.phone) && setStep(5)} disabled={!sel.name || !sel.phone}
                style={{ flex: 2, padding: '0.875rem', borderRadius: '999px', background: (sel.name && sel.phone) ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'rgba(209,213,219,0.5)', color: (sel.name && sel.phone) ? 'white' : '#9ca3af', fontWeight: 600, border: 'none', cursor: (sel.name && sel.phone) ? 'pointer' : 'not-allowed', boxShadow: (sel.name && sel.phone) ? '0 4px 16px rgba(161,23,56,0.25)' : 'none', fontSize: '0.875rem' }}>
                המשך לתשלום 💳
              </button>
            </div>
          </div>
        )}

        {/* Step 5 - Payment */}
        {confirmed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(34,197,94,0.35)' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2rem', color: '#A11738', margin: '0 0 0.5rem' }}>התור נקבע בהצלחה! 🎉</h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.75rem' }}>ליאור תיצור איתך קשר לאישור סופי</p>
            <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: '24px', padding: '1.5rem 2rem', width: '100%', maxWidth: 340, boxShadow: '0 8px 32px rgba(161,23,56,0.08)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>טיפול</span>
                <span style={{ color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>{serviceNames}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>תאריך</span>
                <span style={{ color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>{dateStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>שעה</span>
                <span style={{ color: '#374151', fontWeight: 600, fontSize: '0.85rem' }}>{sel.time}</span>
              </div>
            </div>
            {/* כפתורי הוסף ליומן */}
            {(() => {
              const getCalDates = () => {
                const dateStr2 = `${sel.date.getFullYear()}-${String(sel.date.getMonth()+1).padStart(2,'0')}-${String(sel.date.getDate()).padStart(2,'0')}`;
                const refDate = new Date(`${dateStr2}T12:00:00Z`);
                const israelLocal = new Date(refDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
                const offsetMins = Math.round((israelLocal - refDate) / 60000);
                const [th, tm] = sel.time.split(':').map(Number);
                const startMins = th * 60 + tm - offsetMins;
                const startH = String(Math.floor(((startMins % 1440) + 1440) % 1440 / 60)).padStart(2, '0');
                const startM = String(((startMins % 60) + 60) % 60).padStart(2, '0');
                const startUTC = new Date(`${dateStr2}T${startH}:${startM}:00Z`);
                const endUTC = new Date(startUTC.getTime() + totalDuration * 60000);
                return { startUTC, endUTC };
              };
              const toGCal = (d) => d.toISOString().replace(/[-:]/g,'').replace('.000','');
              const addGoogle = () => {
                const { startUTC, endUTC } = getCalDates();
                const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('תור - ליאור שגב ביוטי 💅')}&dates=${toGCal(startUTC)}/${toGCal(endUTC)}&details=${encodeURIComponent(`טיפול: ${serviceNames}`)}&location=${encodeURIComponent('ליאור שגב ביוטי')}`;
                window.open(url, '_blank');
              };
              const addApple = () => {
                const { startUTC, endUTC } = getCalDates();
                const fmt = (d) => d.toISOString().replace(/[-:]/g,'').replace('.000','');
                const ics = [`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//Lior Segev Beauty//IL`,`BEGIN:VEVENT`,`DTSTART:${fmt(startUTC)}`,`DTEND:${fmt(endUTC)}`,`SUMMARY:תור - ליאור שגב ביוטי 💅`,`DESCRIPTION:טיפול: ${serviceNames}`,`STATUS:CONFIRMED`,`END:VEVENT`,`END:VCALENDAR`].join('\r\n');
                const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'tor-lior-segev.ics';
                link.click();
              };
              return (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', width: '100%', maxWidth: 340 }}>
                  <button onClick={addApple} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', borderRadius: '999px', background: 'rgba(0,0,0,0.85)', color: 'white', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    Apple Calendar
                  </button>
                  <button onClick={addGoogle} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.75rem', borderRadius: '999px', background: '#4285F4', color: 'white', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(66,133,244,0.35)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                    Google Calendar
                  </button>
                </div>
              );
            })()}
            <button onClick={clearAndBack} style={{ padding: '0.875rem 2.5rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 6px 24px rgba(161,23,56,0.3)' }}>חזרה לעמוד הבית</button>
          </div>
        )}

        {!confirmed && step === 5 && (
          <div>
            <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '2rem', fontWeight: 300, color: '#3d0c16', marginBottom: '0.2rem' }}>תשלום מקדמה</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '1.75rem' }}>להשלמת הרישום יש להעביר מקדמה 🌸</p>

            {/* סיכום תור */}
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#374151', fontSize: '0.85rem' }}>{svc.name}</span>
                  <span style={{ color: '#EC6A83', fontWeight: 600, fontSize: '0.85rem' }}>{fmtPrice(svc.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1.5px solid rgba(247,193,195,0.35)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#A11738', fontSize: '0.85rem' }}>סה"כ</span>
                <span style={{ fontFamily: "'Varela Round', sans-serif", fontWeight: 300, fontSize: '1.5rem', color: '#EC6A83' }}>{fmtPrice(totalPrice)}</span>
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '6px' }}>{dateStr} · {sel.time}</p>
            </div>

            {/* כרטיס מקדמה */}
            <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', padding: '2rem 1.5rem', marginBottom: '1.25rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.78rem', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>תשלום מקדמה</p>
              <p style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '3rem', fontWeight: 700, color: '#A11738', margin: '0 0 0.4rem', lineHeight: 1 }}>₪{deposit}</p>
              <p style={{ color: '#b0b8c4', fontSize: '0.75rem' }}>50% ממחיר הטיפול</p>
            </div>

            {/* כפתורי תשלום */}
            {(() => {
              const bookAndConfirm = async () => {
                const rawTime = sel.time.trim();
                const dateStr2 = `${sel.date.getFullYear()}-${String(sel.date.getMonth()+1).padStart(2,'0')}-${String(sel.date.getDate()).padStart(2,'0')}`;
                const refDate = new Date(`${dateStr2}T12:00:00Z`);
                const israelLocal = new Date(refDate.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
                const israelOffsetMins = Math.round((israelLocal - refDate) / 60000);
                const [th, tm] = rawTime.split(':').map(Number);
                const startMins = th * 60 + tm - israelOffsetMins;
                const startH = String(Math.floor(((startMins % 1440) + 1440) % 1440 / 60)).padStart(2, '0');
                const startM = String(((startMins % 60) + 60) % 60).padStart(2, '0');
                const startUTC = new Date(`${dateStr2}T${startH}:${startM}:00Z`);
                const endUTC = new Date(startUTC.getTime() + totalDuration * 60000);
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app/api'}/appointments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      business_slug: 'lior-segev',
                      service_id: selectedServices[0] ? selectedServices[0].id : null,
                      customer_name: sel.name,
                      customer_phone: sel.phone,
                      appointment_time: startUTC.toISOString(),
                      end_time: endUTC.toISOString(),
                    })
                  });
                } catch(e) { console.error('booking failed', e); }
                try { sessionStorage.removeItem(BOOKING_KEY); } catch(e) {}
                setConfirmed(true);
              };
              return (<>
                {/* ביט */}
                <a href={`bit://pay?phoneNumber=0535249688&amount=${deposit}`} target="_blank" rel="noreferrer"
                  onClick={bookAndConfirm}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '1rem', borderRadius: '999px', background: 'linear-gradient(135deg, #5B3FD4, #7B5FFF)', color: 'white', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', marginBottom: '10px', boxSizing: 'border-box', boxShadow: '0 6px 24px rgba(91,63,212,0.38)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.25)"/><text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="white" fontFamily="Arial">B</text></svg>
                  תשלום בביט — ₪{deposit}
                </a>
                {/* פייבוקס */}
                <a href={`https://payboxapp.page.link/pay?userId=0535249688&sum=${deposit}`} target="_blank" rel="noreferrer"
                  onClick={bookAndConfirm}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '1rem', borderRadius: '999px', background: 'linear-gradient(135deg, #00A86B, #00C97A)', color: 'white', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', marginBottom: '10px', boxSizing: 'border-box', boxShadow: '0 6px 24px rgba(0,168,107,0.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.25)"/><text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="Arial">P</text></svg>
                  תשלום בפייבוקס — ₪{deposit}
                </a>
              </>);
            })()}

            <button onClick={() => setStep(4)} style={{ width: '100%', padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', color: '#A11738', fontWeight: 500, cursor: 'pointer' }}>חזרה</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── SERVICE MODAL ─────────────────────────────────────────────
const ServiceModal = ({ service, onSave, onClose }) => {
  const [form, setForm] = useState({ name: service?.name || '', duration: service?.duration || 30, price: service?.price || 0, category: service?.category || "לק ג'ל 💅" });
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(161,23,56,0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', fontFamily: 'Varela Round, sans-serif' }}>
      <div dir="rtl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '28px', padding: '1.5rem', width: '100%', maxWidth: '420px', margin: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.25rem', margin: 0 }}>{service ? 'עריכת שירות' : 'שירות חדש'}</h2>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" className="w-5 h-5" /></button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>שם השירות</label>
          <input style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>קטגוריה</label>
          <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>לק ג&apos;ל 💅</option>
            <option>פנים 💆</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>משך (דקות)</label>
            <input type="number" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
              value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>מחיר (₪)</label>
            <input type="number" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
              value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1.5px solid rgba(247,193,195,0.5)', color: '#A11738', fontWeight: 700, cursor: 'pointer' }}>ביטול</button>
          <button onClick={() => form.name && onSave(form)} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: form.name ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: form.name ? 'pointer' : 'not-allowed', boxShadow: form.name ? '0 8px 24px rgba(161,23,56,0.32)' : 'none' }}>
            {service ? 'שמירה' : 'הוספה'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── FAN GALLERY ───────────────────────────────────────────────
const GALLERY_IMAGES = [
  ...Array.from({ length: 21 }, (_, i) => `/gallery/1 - ${i + 1}.jpeg`),
  '/gallery/26C7B032-40D9-43E1-9BCF-8DBB8B14284E.JPG',
  '/gallery/7F27DFF2-0FDA-4E72-93BE-D0A6093C84F1.JPG',
  '/gallery/FullSizeRender 2.JPG',
  '/gallery/FullSizeRender.JPG',
  '/gallery/IMG_0331.JPG',
  '/gallery/IMG_0926.jpg',
  '/gallery/IMG_1216.jpg',
  '/gallery/IMG_1318.JPG',
  '/gallery/IMG_2511.JPG',
  '/gallery/IMG_4191.JPG',
  '/gallery/IMG_4209 2.JPG',
  '/gallery/IMG_4211.JPG',
  '/gallery/IMG_4212.JPG',
  '/gallery/IMG_4414.JPG',
  '/gallery/IMG_4416.JPG',
  '/gallery/IMG_4455.JPG',
  '/gallery/IMG_4464 2.JPG',
  '/gallery/IMG_4484 2.JPG',
  '/gallery/IMG_4822 2.JPG',
  '/gallery/IMG_6254 2.JPG',
  '/gallery/IMG_7816.JPG',
  '/gallery/IMG_8406.JPG',
  '/gallery/IMG_9674.JPG',
  '/gallery/לק פיגוז -1 .png',
];
const TOTAL_IMAGES = GALLERY_IMAGES.length;

const FAN_CONFIG = {
  '-2': { x: -105, rotate: -26, scale: 0.70, z: 1, opacity: 0.52 },
  '-1': { x: -54,  rotate: -13, scale: 0.84, z: 3, opacity: 0.80 },
   '0': { x: 0,    rotate: 0,   scale: 1,    z: 5, opacity: 1    },
   '1': { x: 54,   rotate: 13,  scale: 0.84, z: 3, opacity: 0.80 },
   '2': { x: 105,  rotate: 26,  scale: 0.70, z: 1, opacity: 0.52 },
};

const FanGallery = () => {
  const [center, setCenter] = useState(0);
  const [lightbox, setLightbox] = useState(null);

  const getOffset = (idx) => {
    let o = idx - center;
    if (o > TOTAL_IMAGES / 2) o -= TOTAL_IMAGES;
    if (o < -TOTAL_IMAGES / 2) o += TOTAL_IMAGES;
    return o;
  };

  const getCfg = (offset) =>
    FAN_CONFIG[String(Math.max(-2, Math.min(2, offset)))] || FAN_CONFIG['2'];

  return (
    <>
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          <img src={GALLERY_IMAGES[lightbox]} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: '20px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', animation: 'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1)' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <div style={{ position: 'relative', height: '285px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
        {GALLERY_IMAGES.map((src, idx) => {
          const offset = getOffset(idx);
          if (Math.abs(offset) > 3) return null;
          const cfg = getCfg(offset);
          const isCenter = offset === 0;
          const isVisible = Math.abs(offset) <= 2;
          return (
            <div key={idx}
              onClick={() => { if (isCenter) setLightbox(idx); else if (isVisible) setCenter(idx); }}
              style={{
                position: 'absolute',
                width: '158px', height: '210px',
                borderRadius: '18px', overflow: 'hidden',
                cursor: isVisible ? 'pointer' : 'default',
                transform: `translateX(${cfg.x}px) rotate(${cfg.rotate}deg) scale(${cfg.scale})`,
                zIndex: cfg.z,
                opacity: cfg.opacity,
                border: '3px solid rgba(255,255,255,0.95)',
                boxShadow: isCenter
                  ? '0 24px 56px rgba(161,23,56,0.28), 0 0 0 1px rgba(255,255,255,0.4)'
                  : '0 8px 20px rgba(161,23,56,0.1)',
                transition: 'all 0.48s cubic-bezier(0.34,1.1,0.64,1)',
                pointerEvents: isVisible ? 'auto' : 'none',
              }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {isCenter && (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(61,12,30,0.3) 0%, transparent 55%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', letterSpacing: '0.14em' }}>לחצי להגדלה</span>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={() => setCenter(c => (c + 1) % TOTAL_IMAGES)}
          style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A11738', fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(161,23,56,0.15)' }}>‹</button>
        <button onClick={() => setCenter(c => (c - 1 + TOTAL_IMAGES) % TOTAL_IMAGES)}
          style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A11738', fontSize: '1.4rem', boxShadow: '0 4px 14px rgba(161,23,56,0.15)' }}>›</button>
      </div>

      <p style={{ textAlign: 'center', color: 'rgba(161,23,56,0.38)', fontSize: '0.67rem', letterSpacing: '0.18em', marginBottom: '0.25rem' }}>{center + 1} / {TOTAL_IMAGES}</p>
    </>
  );
};

// ── PORTFOLIO PAGE ────────────────────────────────────────────
const PortfolioPage = ({ onBook }) => {
  useEffect(() => {
    const initGSAP = async () => {
      try {
        const gsapModule = await import('gsap');
        const stModule = await import('gsap/ScrollTrigger');
        const gsap = gsapModule.gsap || gsapModule.default;
        const { ScrollTrigger } = stModule;
        gsap.registerPlugin(ScrollTrigger);

        gsap.utils.toArray('.reveal-sec').forEach(el => {
          gsap.fromTo(el,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%' } }
          );
        });
      } catch(e) {
        // GSAP failed — make all sections visible immediately
        document.querySelectorAll('.reveal-sec').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    };
    initGSAP();
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: '100vh', fontFamily: "'Varela Round', sans-serif", background: 'linear-gradient(160deg, #FDECE5 0%, #F7C1C3 50%, #EC6A83 100%)', overflowX: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{ paddingTop: '80px', paddingBottom: '3rem', textAlign: 'center', padding: '80px 1.75rem 3rem', animation: 'fadeUp 0.9s 0.1s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(161,23,56,0.25)', boxShadow: '0 12px 40px rgba(161,23,56,0.22)' }}>
            <img src="/lior-profile.png" alt="ליאור שגב" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }} />
          </div>
        </div>
        <h1 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: 'clamp(2.8rem, 11vw, 5rem)', fontWeight: 700, color: '#A11738', lineHeight: 1.1, marginBottom: '0.5rem', letterSpacing: '0.01em', animation: 'breathe 4s ease-in-out infinite', display: 'inline-block' }}>
          היופי שלך
        </h1>
        <p style={{ color: '#A11738', fontSize: '0.72rem', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7, marginBottom: '2.5rem' }}>
          Lior Segev Beauty
        </p>
        <button className="lux-btn" onClick={onBook} style={{
          width: '100%', maxWidth: '360px', height: '64px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #A11738 0%, #EC6A83 100%)',
          color: 'white', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(161,23,56,0.38), inset 0 1px 0 rgba(255,255,255,0.18)',
          animation: 'pulse-glow 3.5s ease-in-out infinite',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}>
          <span>💅</span> קביעת תור
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 1.25rem 6rem' }}>

        {/* Divider */}
        <div className="reveal-sec" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '2.5rem 0 2.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(236,106,131,0.3))' }} />
          <span style={{ color: '#EC6A83', fontSize: '0.85rem', opacity: 0.5, letterSpacing: '0.3em' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(236,106,131,0.3))' }} />
        </div>

        {/* Gallery */}
        <div className="reveal-sec" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Varela Round', sans-serif", fontSize: '1.9rem', fontWeight: 300, color: '#3d0c16', textAlign: 'center', marginBottom: '1.75rem' }}>
            תיק עבודות
          </h2>
          <FanGallery />
        </div>

        {/* Social card */}
        <div className="reveal-sec social-card-breathe" style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(255,245,247,0.9), rgba(252,231,243,0.85), rgba(243,238,255,0.9))', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '32px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 12px 48px rgba(161,23,56,0.1), inset 0 1px 0 rgba(255,255,255,1)', marginBottom: '1.75rem', overflow: 'hidden' }}>

          {/* Sparkles */}
          <span className="sparkle sp1" style={{ position: 'absolute', top: '14%', right: '12%', fontSize: '1rem', opacity: 0.7 }}>✦</span>
          <span className="sparkle sp2" style={{ position: 'absolute', top: '18%', right: '20%', fontSize: '0.5rem', opacity: 0.5 }}>✦</span>
          <span className="sparkle sp3" style={{ position: 'absolute', top: '10%', left: '15%', fontSize: '0.65rem', opacity: 0.5 }}>✦</span>
          <span className="sparkle sp4" style={{ position: 'absolute', bottom: '20%', left: '10%', fontSize: '0.8rem', opacity: 0.4 }}>✦</span>
          <span className="sparkle sp5" style={{ position: 'absolute', bottom: '25%', right: '8%', fontSize: '0.55rem', opacity: 0.45 }}>✦</span>

          {/* Title */}
          <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #A11738, #c4607a, #9b6b3a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.1rem', lineHeight: 1.2 }}>Lior Segev Beauty</p>

          {/* Studio line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to left, #c4a35a, transparent)' }} />
            <span style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: '#c4a35a', fontWeight: 700, textTransform: 'uppercase' }}>Studio</span>
            <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, #c4a35a, transparent)' }} />
          </div>

          <p style={{ color: '#b08fa0', fontSize: '0.78rem', letterSpacing: '0.12em', marginBottom: '1.75rem' }}>עקבי אחרי הקסם</p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
            {/* Facebook */}
            <a href="https://www.facebook.com/share/1DLKLrkWFb/" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: '#1877F2', textDecoration: 'none', boxShadow: '0 8px 24px rgba(24,119,242,0.35)', transition: 'transform 0.2s' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/liors_beauty" target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,#f9ce34 0%,#ee2a7b 50%,#6228d7 100%)', textDecoration: 'none', boxShadow: '0 8px 24px rgba(238,42,123,0.35)', transition: 'transform 0.2s' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1.2" fill="white" stroke="none"/>
              </svg>
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────
const Dashboard = ({ user, onLogout, appointments, setAppointments }) => {
  const [tab, setTab] = useState('overview');
  const [services, setServices] = useState(MOCK_SERVICES);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);
  const [showModal, setShowModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selDay, setSelDay] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '', rawText: '' });
  const [parsingAI, setParsingAI] = useState(false);
  const [noteModal, setNoteModal] = useState({ open: false, apptId: null, text: '' });
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_time: '09:00', end_time: '10:00', reason: '' });

  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app';
  const VAPID_PUBLIC = 'BJruLIZOsClN97fYdg9i5G52FyTQGEVD_5pSAW6BWQNPKO5lecZhhOn58DCnS1aEkPX1qWQIKcA9INApaRiW1X0';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    fetch(BACKEND + '/api/services', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setServices(data); });
    fetch(BACKEND + '/api/appointments', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setAppointments(data); });
    fetch(BACKEND + '/api/availability', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setAvailability(data.map(d => ({ ...d, start_time: (d.start_time || '').slice(0, 5), end_time: (d.end_time || '').slice(0, 5) }))); });
    fetch(BACKEND + '/api/blocked-slots', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setBlockedSlots(data.map(b => ({ ...b, start_time: (b.start_time || '').slice(0, 5), end_time: (b.end_time || '').slice(0, 5) }))); });

    const es = new EventSource(BACKEND + '/api/appointments/stream?token=' + token);
    es.onmessage = (e) => {
      if (e.data === 'refresh') {
        fetch(BACKEND + '/api/appointments', { headers: { 'Authorization': 'Bearer ' + token } })
          .then(r => r.json()).then(data => { if (Array.isArray(data)) setAppointments(data); });
      }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const registerPush = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const perm = await Notification.requestPermission();
        if (perm !== "granted") return;
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC });
        await fetch(BACKEND + "/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
        console.log("✅ Push registered");
      } catch(e) { console.log("Push setup failed", e); }
    };
    registerPush();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const enablePush = async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { showToast("לא אושרו התראות"); return; }
      const VAPID = "BJruLIZOsClN97fYdg9i5G52FyTQGEVD_5pSAW6BWQNPKO5lecZhhOn58DCnS1aEkPX1qWQIKcA9INApaRiW1X0";
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID });
      await fetch("https://booking-saas-production-b9fd.up.railway.app/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      showToast("התראות הופעלו ✅");
    } catch(e) { showToast("שגיאה בהפעלת התראות"); }
  };
  const todayAppts = appointments.filter(a => new Date(a.appointment_time).toDateString() === new Date().toDateString() && a.status !== 'cancelled');
  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const revenue = todayAppts.filter(a => a.status === 'confirmed' || a.status === 'completed').reduce((s, a) => s + (a.price || 0), 0);
  const upcoming = appointments.filter(a => new Date(a.appointment_time) > new Date() && a.status !== 'cancelled').length;
  const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const openWhatsApp = (appt, type) => {
    const phone = '972' + appt.customer_phone.replace(/-/g, '').slice(1);
    const date = fmtDate(appt.appointment_time);
    const time = fmtTime(appt.appointment_time);
    const msg = type === 'confirm'
      ? `היי ${appt.customer_name} 🌸\nהתור שלך אושר!\n📅 תאריך: ${date}\n🕐 שעה: ${time}\n💅 טיפול: ${appt.service_name}\nנתראה! — ליאור שגב ביוטי`
      : `היי ${appt.customer_name}, לצערי התור שלך ל${date} בשעה ${time} בוטל. ניצור איתך קשר לקביעת תור חדש 🙏`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const approveAppt = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(BACKEND + '/api/appointments/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status: 'confirmed' })
      });
    } catch(e) { console.error('approve failed', e); }
    const appt = appointments.find(a => a.id === id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    showToast('התור אושר ✅');
    if (appt) openWhatsApp(appt, 'confirm');
  };
  const cancelAppt = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(BACKEND + '/api/appointments/' + id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status: 'cancelled' })
      });
    } catch(e) { console.error('cancel failed', e); }
    const appt = appointments.find(a => a.id === id);
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    showToast('התור בוטל');
    if (appt) openWhatsApp(appt, 'cancel');
  };

  const addManualAppt = async () => {
    if (!newAppt.customer_name || !newAppt.date || !newAppt.time) return;
    const token = localStorage.getItem('token');
    const dt = new Date(newAppt.date + 'T' + newAppt.time);
    try {
      const r = await fetch(BACKEND + '/api/appointments/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({
          customer_name: newAppt.customer_name,
          service_name: newAppt.service_name || 'טיפול',
          appointment_time: dt.toISOString(),
          price: parseFloat(newAppt.price) || 0,
          deposit: parseFloat(newAppt.deposit) || 0,
        }),
      });
      if (!r.ok) { showToast('שגיאה בשמירת התור ❌'); return; }
      const saved = await r.json();
      setAppointments(function(prev) { return prev.concat([saved]); });
      setNewAppt({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '', rawText: '' });
      setShowAddAppt(false);
      showToast('התור נשמר ✅');
    } catch (e) {
      showToast('שגיאת רשת ❌');
    }
  };

  const navItems = [
    { id: 'overview', label: 'סקירה', icon: 'home' },
    { id: 'pending', label: `ממתינים${pendingAppts.length > 0 ? ` (${pendingAppts.length})` : ''}`, icon: 'clock' },
    { id: 'calendar', label: 'יומן', icon: 'calendar' },
    { id: 'services', label: 'שירותים', icon: 'sparkles' },
    { id: 'customers', label: 'לקוחות', icon: 'users' },
    { id: 'availability', label: 'שעות', icon: 'clock' },
    { id: 'portfolio', label: 'תיק עבודות', icon: 'portfolio' },
  ];

  const mainStyle = { flex: 1, overflowY: 'auto', fontFamily: 'Varela Round, sans-serif', background: 'linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%)', paddingBottom: '80px' };
  const card = { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(161,23,56,0.07), inset 0 1px 0 rgba(255,255,255,0.9)' };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {toast && <div style={{ position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'rgba(161,23,56,0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Varela Round, sans-serif', boxShadow: '0 8px 24px rgba(161,23,56,0.32)' }}>{toast}</div>}

      {viewImage && (
        <div onClick={() => setViewImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewImage} alt="inspiration" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '16px' }} />
        </div>
      )}

      {/* Top Header */}
      <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.7)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/symbol.png" alt="LS" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 900, color: '#A11738', fontSize: '0.9rem', fontFamily: 'Varela Round, sans-serif' }}>ליאור שגב</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTab('booking')} style={{ padding: '6px 12px', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif', boxShadow: '0 4px 12px rgba(161,23,56,0.28)' }}>🔗 הזמנות</button>
          <button onClick={onLogout} style={{ padding: '6px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.65)', color: '#A11738', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>יציאה</button>
        </div>
      </div>

      {/* Main */}
      <div style={mainStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#A11738", margin: 0 }}>{new Date().getHours() < 12 ? "בוקר טוב" : "צהריים טובים"} ליאור ✨</h1>
                  <button onClick={enablePush} style={{ marginTop: "8px", fontSize: "0.75rem", padding: "4px 12px", borderRadius: "8px", background: "#F7C1C3", color: "#A11738", border: "none", cursor: "pointer", fontWeight: 700 }}>🔔 הפעל התראות</button>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>הנה מה שקורה היום</p>
                </div>
                <button onClick={() => setTab('booking')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: '#F7C1C3', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>
                  <Icon name="link" className="w-4 h-4" /> דף הזמנות
                </button>
              </div>

              {pendingAppts.length > 0 && (
                <div style={{ background: 'rgba(254,243,199,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(252,211,77,0.35)', borderRadius: '20px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏳</span>
                  <div>
                    <p style={{ fontWeight: 900, color: '#92400e', margin: 0 }}>{pendingAppts.length} תורים ממתינים לאישור!</p>
                    <button onClick={() => setTab('pending')} style={{ color: '#b45309', fontWeight: 700, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>לחצי לאישור ←</button>
                  </div>
                </div>
              )}

              <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[{ label: 'תורים היום', value: todayAppts.length, emoji: '🗓' }, { label: 'הכנסה היום', value: fmtPrice(revenue), emoji: '💰' }, { label: 'תורים קרובים', value: upcoming, emoji: '⏰' }].map((s, i) => (
                  <div key={i} style={{ ...card, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b7280' }}>{s.label}</span>
                      <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={card}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb' }}>
                  <h2 style={{ fontWeight: 900, color: '#A11738', margin: 0 }}>תורים היום 🗓</h2>
                </div>
                {todayAppts.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>אין תורים להיום</p>
                  </div>
                ) : todayAppts.map(appt => (
                  <div key={appt.id} style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #fafafa' }}>
                    <p style={{ fontWeight: 900, color: '#A11738', margin: 0, fontSize: '0.875rem', flexShrink: 0 }}>{fmtTime(appt.appointment_time)}</p>
                    <div style={{ width: '3px', height: '36px', borderRadius: '999px', flexShrink: 0, background: '#F7C1C3' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: '#A11738', margin: 0, fontSize: '0.875rem' }}>{appt.customer_name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 0' }}>{appt.service_name}</p>
                    </div>
                    {appt.image && <img src={appt.image} alt="ins" onClick={() => setViewImage(appt.image)} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #F7C1C3', cursor: 'pointer' }} />}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: appt.status === 'completed' ? '#d1fae5' : appt.status === 'pending' ? '#fef3c7' : '#F7C1C3', color: appt.status === 'completed' ? '#059669' : appt.status === 'pending' ? '#92400e' : '#A11738' }}>
                      {appt.status === 'completed' ? 'הושלם' : appt.status === 'pending' ? 'ממתין' : 'מאושר'}
                    </span>
                    <span style={{ fontWeight: 900, color: '#EC6A83', fontSize: '0.9rem', flexShrink: 0 }}>{fmtPrice(appt.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PENDING */}
          {tab === 'pending' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.5rem' }}>תורים לאישור ⏳</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>אישרי או בטלי כל תור</p>
              {pendingAppts.length === 0 ? (
                <div style={{ ...card, padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                  <p style={{ fontWeight: 700 }}>אין תורים ממתינים</p>
                </div>
              ) : pendingAppts.map(appt => (
                <div key={appt.id} style={{ ...card, padding: '1.25rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontWeight: 900, color: '#A11738', margin: 0 }}>{appt.customer_name}</p>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '2px 0 0' }}>{appt.customer_phone}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: '#fef3c7', color: '#92400e' }}>ממתין</span>
                  </div>
                  <p style={{ fontWeight: 700, color: '#EC6A83', margin: '0 0 4px' }}>{appt.service_name}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px' }}>{fmtDate(appt.appointment_time)} | {fmtTime(appt.appointment_time)}</p>
                  <p style={{ fontWeight: 900, color: '#EC6A83', margin: '0 0 12px' }}>{fmtPrice(appt.price)}</p>
                  {appt.notes && <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0 0 8px', fontStyle: 'italic' }}>📝 {appt.notes}</p>}
                  {appt.image && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>השראה שהלקוחה העלתה:</p>
                      <img src={appt.image} alt="inspiration" onClick={() => setViewImage(appt.image)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #F7C1C3', cursor: 'pointer' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setNoteModal({ open: true, apptId: appt.id, text: appt.notes || '' })} style={{ padding: '0.625rem', borderRadius: '10px', background: appt.notes ? '#fef3c7' : '#f3f4f6', color: appt.notes ? '#92400e' : '#6b7280', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>📝</button>
                    <a href={`https://wa.me/972${appt.customer_phone.replace(/-/g,'').slice(1)}?text=${encodeURIComponent(`היי ${appt.customer_name} 🌸\nהתור שלך ל${appt.service_name} ב${fmtDate(appt.appointment_time)} בשעה ${fmtTime(appt.appointment_time)} אושר! מחכה לך 💅`)}`}
                      target="_blank" rel="noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.625rem', borderRadius: '10px', background: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
                      <Icon name="whatsapp" className="w-4 h-4" /> וואטסאפ
                    </a>
                    <button onClick={() => approveAppt(appt.id)} style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>✅ אישור</button>
                    <button onClick={() => cancelAppt(appt.id)} style={{ flex: 1, padding: '0.625rem', borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}>❌ ביטול</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CALENDAR */}
          {showAddAppt && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(161,23,56,0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', fontFamily: 'Varela Round, sans-serif' }}>
              <div dir="rtl" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '28px', padding: '1.5rem', width: '100%', maxWidth: '420px', margin: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.25rem', margin: 0 }}>הוסף תור ידני</h2>
                  <button onClick={() => setShowAddAppt(false)} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" className="w-5 h-5" /></button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>כתבי את פרטי התור בחופשיות ✍️</label>
                  <textarea
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.8rem', direction: 'rtl', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical', fontFamily: 'Varela Round, sans-serif', lineHeight: 1.6, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}
                    placeholder={"לדוגמה:\nאתל חיים, לק גל, בשעה 12 ב-16 למאי\nשרה כהן, הרמת ריסים, 20/5 ב-14:30, 200₪"}
                    value={newAppt.rawText || ''}
                    onChange={e => setNewAppt({ ...newAppt, rawText: e.target.value })}
                  />
                  <button
                    onClick={async () => {
                      if (!newAppt.rawText || !newAppt.rawText.trim()) return;
                      setParsingAI(true);
                      try {
                        const r = await fetch('/api/parse-appointment', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ text: newAppt.rawText }),
                        });
                        const data = await r.json();
                        if (!r.ok) { showToast(data.error || 'שגיאה בפרסור'); return; }
                        setNewAppt(prev => ({
                          ...prev,
                          customer_name: data.customer_name || prev.customer_name,
                          service_name: data.service_name || prev.service_name,
                          date: data.date || prev.date,
                          time: data.time || prev.time,
                          price: data.price != null ? String(data.price) : prev.price,
                          deposit: data.deposit != null ? String(data.deposit) : prev.deposit,
                        }));
                        showToast('פורסר בהצלחה ✨');
                      } catch { showToast('שגיאה בפרסור'); }
                      finally { setParsingAI(false); }
                    }}
                    disabled={parsingAI}
                    style={{ marginTop: '8px', width: '100%', padding: '0.625rem', borderRadius: '14px', background: parsingAI ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: parsingAI ? 'not-allowed' : 'pointer', fontFamily: 'Varela Round, sans-serif' }}
                  >
                    {parsingAI ? '⏳ מפרסר...' : '✨ פרסור חכם'}
                  </button>
                </div>
                {(newAppt.customer_name || newAppt.date) && (
                  <div style={{ background: '#F7C1C3', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#A11738' }}>
                    {newAppt.customer_name && <p style={{ margin: '2px 0', fontWeight: 700 }}>👤 {newAppt.customer_name}</p>}
                    {newAppt.service_name && <p style={{ margin: '2px 0' }}>💅 {newAppt.service_name}</p>}
                    {newAppt.date && <p style={{ margin: '2px 0' }}>📅 {newAppt.date} בשעה {newAppt.time}</p>}
                    {newAppt.price && <p style={{ margin: '2px 0' }}>💰 סה״כ: ₪{newAppt.price} | מקדמה: ₪{newAppt.deposit}</p>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setShowAddAppt(false); setNewAppt({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '', rawText: '' }); setParsingAI(false); }} style={{ flex: 1, padding: '0.875rem', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1.5px solid rgba(247,193,195,0.5)', borderRadius: '14px', color: '#A11738', fontWeight: 700, cursor: 'pointer' }}>ביטול</button>
                  <button onClick={addManualAppt} disabled={!newAppt.customer_name || !newAppt.date || !newAppt.time} style={{ flex: 1, padding: '0.875rem', borderRadius: '999px', background: (!newAppt.customer_name || !newAppt.date || !newAppt.time) ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: (!newAppt.customer_name || !newAppt.date || !newAppt.time) ? 'not-allowed' : 'pointer' }}>
                    שריין ביומן ✅
                  </button>
                </div>
              </div>
            </div>
          )}

          {noteModal.open && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(161,23,56,0.2)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', fontFamily: 'Varela Round, sans-serif' }}>
              <div dir="rtl" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '380px', margin: '1rem', boxShadow: '0 8px 32px rgba(161,23,56,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.1rem', margin: 0 }}>📝 הערה לתור</h2>
                  <button onClick={() => setNoteModal({ open: false, apptId: null, text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                </div>
                <textarea
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '14px', border: '1.5px solid rgba(247,193,195,0.5)', outline: 'none', fontSize: '0.85rem', direction: 'rtl', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical', fontFamily: 'Varela Round, sans-serif', lineHeight: 1.6, background: 'rgba(255,255,255,0.8)' }}
                  placeholder="כתבי הערה לתור..."
                  value={noteModal.text}
                  onChange={e => setNoteModal(n => ({ ...n, text: e.target.value }))}
                  maxLength={1000}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                  <button onClick={() => setNoteModal({ open: false, apptId: null, text: '' })} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(247,193,195,0.5)', color: '#A11738', fontWeight: 700, cursor: 'pointer' }}>ביטול</button>
                  <button onClick={async () => {
                    const token = localStorage.getItem('token');
                    try {
                      const r = await fetch(BACKEND + `/api/appointments/${noteModal.apptId}/notes`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                        body: JSON.stringify({ notes: noteModal.text }),
                      });
                      if (!r.ok) { showToast('שגיאה בשמירה'); return; }
                      setAppointments(prev => prev.map(a => a.id === noteModal.apptId ? { ...a, notes: noteModal.text } : a));
                      setNoteModal({ open: false, apptId: null, text: '' });
                      showToast('ההערה נשמרה ✅');
                    } catch { showToast('שגיאה בשמירה'); }
                  }} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>שמור</button>
                </div>
              </div>
            </div>
          )}

          {showBlockModal && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', fontFamily: 'Varela Round, sans-serif' }}>
              <div dir="rtl" style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '380px', margin: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.1rem', margin: 0 }}>🚫 חסימת שעות — {selDay.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}</h2>
                  <button onClick={() => setShowBlockModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  {['start_time', 'end_time'].map((field, fi) => (
                    <select key={field} value={blockForm[field]} onChange={e => setBlockForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.875rem', background: 'white' }}>
                      {Array.from({ length: 33 }, (_, k) => { const tot = k * 30; const h = String(6 + Math.floor(tot / 60)).padStart(2, '0'); const m = tot % 60 === 0 ? '00' : '30'; return `${h}:${m}`; }).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )).reduce((acc, el, idx) => idx === 0 ? [el] : [...acc, <span key="s" style={{ color: '#9ca3af' }}>עד</span>, el], [])}
                </div>
                <input placeholder="סיבה (אופציונלי)" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem', fontFamily: 'Varela Round, sans-serif' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowBlockModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>ביטול</button>
                  <button onClick={async () => {
                    const token = localStorage.getItem('token');
                    const dateStr = `${selDay.getFullYear()}-${String(selDay.getMonth()+1).padStart(2,'0')}-${String(selDay.getDate()).padStart(2,'0')}`;
                    try {
                      const r = await fetch(BACKEND + '/api/blocked-slots', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ date: dateStr, start_time: blockForm.start_time, end_time: blockForm.end_time, reason: blockForm.reason }) });
                      const created = await r.json();
                      setBlockedSlots(prev => [...prev, { ...created, start_time: (created.start_time || '').slice(0,5), end_time: (created.end_time || '').slice(0,5) }]);
                      setShowBlockModal(false);
                      showToast('✅ החסימה נשמרה');
                    } catch { showToast('שגיאה בשמירה'); }
                  }} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>שמור חסימה</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'calendar' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: 0 }}>יומן 🗓</h1>
                <button onClick={() => setShowAddAppt(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.625rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>
                  <Icon name="plus" className="w-4 h-4" /> הוסף תור
                </button>
              </div>
              <div className="admin-calendar-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb' }}>
                    <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronR" className="w-4 h-4" /></button>
                    <span style={{ fontWeight: 900, color: '#A11738' }}>{calMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronL" className="w-4 h-4" /></button>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '8px' }}>
                      {['א','ב','ג','ד','ה','ו','ש'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af', padding: '4px' }}>{d}</div>)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                      {Array.from({ length: new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay() }).map((_, i) => <div key={`e${i}`} />)}
                      {Array.from({ length: new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
                        const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), i + 1);
                        const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                        const hasA = appointments.some(a => new Date(a.appointment_time).toDateString() === d.toDateString() && a.status !== 'cancelled');
                        const dayBlocks = blockedSlots.filter(b => b.date && b.date.slice(0,10) === dateStr);
                        const isFullyBlocked = dayBlocks.some(b => b.start_time <= '06:00' && b.end_time >= '22:00');
                        const hasBlock = dayBlocks.length > 0;
                        const isSel = d.toDateString() === selDay.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                          <button key={i} onClick={() => setSelDay(d)}
                            style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', position: 'relative', background: isSel ? 'linear-gradient(135deg,#A11738,#EC6A83)' : isFullyBlocked ? '#e5e7eb' : isToday ? '#F7C1C3' : 'transparent', color: isSel ? 'white' : isFullyBlocked ? '#9ca3af' : '#A11738' }}>
                            {i + 1}
                            {hasA && <div style={{ position: 'absolute', bottom: '3px', right: '50%', transform: 'translateX(50%)', width: '6px', height: '6px', borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : '#EC6A83' }} />}
                            {hasBlock && !hasA && <div style={{ position: 'absolute', bottom: '3px', right: '50%', transform: 'translateX(50%)', width: '6px', height: '6px', borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.5)' : '#f59e0b' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={card}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 900, color: '#A11738', margin: 0, fontSize: '0.875rem' }}>{selDay.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                    <button onClick={() => { setBlockForm({ start_time: '09:00', end_time: '10:00', reason: '' }); setShowBlockModal(true); }} style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '8px', background: '#fef3c7', color: '#92400e', fontWeight: 700, border: 'none', cursor: 'pointer' }}>🚫 חסום שעות</button>
                  </div>
                  {blockedSlots.filter(b => b.date && b.date.slice(0,10) === `${selDay.getFullYear()}-${String(selDay.getMonth()+1).padStart(2,'0')}-${String(selDay.getDate()).padStart(2,'0')}`).map(bl => (
                    <div key={bl.id} style={{ padding: '0.625rem 1.25rem', borderBottom: '1px solid #fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb' }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#92400e' }}>🚫 {bl.start_time} – {bl.end_time}</span>
                        {bl.reason && <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>{bl.reason}</p>}
                      </div>
                      <button onClick={async () => { const token = localStorage.getItem('token'); await fetch(BACKEND + `/api/blocked-slots/${bl.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }); setBlockedSlots(prev => prev.filter(x => x.id !== bl.id)); showToast('החסימה הוסרה'); }} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, border: 'none', cursor: 'pointer' }}>הסר</button>
                    </div>
                  ))}
                  {appointments.filter(a => new Date(a.appointment_time).toDateString() === selDay.toDateString() && a.status !== 'cancelled').map(appt => (
                    <div key={appt.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 700, color: '#A11738', margin: 0, fontSize: '0.875rem' }}>{appt.customer_name}</p>
                          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 4px' }}>{fmtTime(appt.appointment_time)} · {appt.service_name}</p>
                          {appt.deposit > 0 && <p style={{ color: '#EC6A83', fontSize: '0.7rem', margin: '0 0 4px', fontWeight: 700 }}>מקדמה: ₪{appt.deposit}</p>}
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: appt.status === 'completed' ? '#d1fae5' : appt.status === 'pending' ? '#fef3c7' : '#F7C1C3', color: appt.status === 'completed' ? '#059669' : appt.status === 'pending' ? '#92400e' : '#A11738', display: 'inline-block' }}>
                            {appt.status === 'completed' ? 'הושלם' : appt.status === 'pending' ? 'ממתין' : 'מאושר'}
                          </span>
                          {appt.notes && <p style={{ color: '#6b7280', fontSize: '0.72rem', margin: '4px 0 0', fontStyle: 'italic' }}>📝 {appt.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {appt.image && <img src={appt.image} alt="ins" onClick={() => setViewImage(appt.image)} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }} />}
                          <button onClick={() => setNoteModal({ open: true, apptId: appt.id, text: appt.notes || '' })} style={{ padding: '4px 8px', borderRadius: '8px', background: appt.notes ? '#fef3c7' : 'rgba(255,255,255,0.6)', color: appt.notes ? '#92400e' : '#9ca3af', fontWeight: 700, fontSize: '0.75rem', border: '1px solid rgba(247,193,195,0.4)', cursor: 'pointer' }} title="הוסף הערה">📝</button>
                          <button onClick={() => cancelAppt(appt.id)} style={{ padding: '4px 8px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', fontWeight: 700, fontSize: '0.7rem', border: 'none', cursor: 'pointer' }}>ביטול</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!appointments.some(a => new Date(a.appointment_time).toDateString() === selDay.toDateString() && a.status !== 'cancelled') && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}><p style={{ fontSize: '0.875rem' }}>אין תורים</p></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {tab === 'services' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: 0 }}>שירותים 💅</h1>
                <button onClick={() => { setEditSvc(null); setShowModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: '#F7C1C3', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>
                  <Icon name="plus" className="w-4 h-4" /> שירות חדש
                </button>
              </div>
              {[...new Set(services.filter(s => s.is_active).map(s => s.category))].map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 900, color: '#EC6A83', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{cat}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                    {services.filter(s => s.is_active && s.category === cat).map(svc => (
                      <div key={svc.id} style={{ ...card, padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <p style={{ fontWeight: 700, color: '#A11738', margin: 0, fontSize: '0.9rem' }}>{svc.name}</p>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => { setEditSvc(svc); setShowModal(true); }} style={{ padding: '5px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="edit" className="w-4 h-4" /></button>
                            <button onClick={async () => { const token = localStorage.getItem('token'); try { await fetch(BACKEND + `/api/services/${svc.id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } }); setServices(prev => prev.filter(s => s.id !== svc.id)); showToast('השירות הוסר'); } catch { showToast('שגיאה בהסרה'); } }} style={{ padding: '5px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="trash" className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '999px', background: '#F7C1C3', color: '#A11738', fontWeight: 700 }}>{svc.duration} דק׳</span>
                          <span style={{ fontWeight: 900, color: '#EC6A83', fontSize: '1rem' }}>{fmtPrice(svc.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {showModal && <ServiceModal service={editSvc} onSave={async (data) => { const token = localStorage.getItem('token'); try { if (editSvc) { const r = await fetch(BACKEND + `/api/services/${editSvc.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(data) }); const updated = await r.json(); setServices(prev => prev.map(s => s.id === editSvc.id ? updated : s)); showToast('השירות עודכן ✅'); } else { const r = await fetch(BACKEND + '/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(data) }); const created = await r.json(); setServices(prev => [...prev, created]); showToast('השירות נוסף ✅'); } } catch { showToast('שגיאה בשמירה'); } setShowModal(false); }} onClose={() => setShowModal(false)} />}
            </div>
          )}

          {/* CUSTOMERS */}
          {tab === 'customers' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '1.5rem' }}>לקוחות 👥</h1>
              {appointments.filter(a => a.status !== 'cancelled').length === 0 ? (
                <div style={{ ...card, padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                  <p style={{ fontWeight: 700 }}>אין לקוחות עדיין</p>
                </div>
              ) : (
                <div style={card}>
                  <div className="admin-customers-table" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af' }}>שם</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af' }}>טלפון</span>
                    <span className="col-hide" style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af' }}>ביקור אחרון</span>
                    <span className="col-hide" style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af' }}>תורים</span>
                  </div>
                  {[...new Map(appointments.filter(a => a.status !== 'cancelled').map(a => [a.customer_phone, a])).values()].map((appt, i) => (
                    <div key={i} className="admin-customers-table" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '1rem 1.5rem', alignItems: 'center', borderBottom: '1px solid #fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 900, background: '#F7C1C3', color: '#A11738', flexShrink: 0 }}>{appt.customer_name[0]}</div>
                        <span style={{ fontWeight: 700, color: '#A11738', fontSize: '0.875rem' }}>{appt.customer_name}</span>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{appt.customer_phone}</span>
                      <span className="col-hide" style={{ color: '#6b7280', fontSize: '0.875rem' }}>{fmtDate(appt.appointment_time)}</span>
                      <span className="col-hide" style={{ fontWeight: 900, color: '#EC6A83', fontSize: '0.875rem' }}>{appointments.filter(a => a.customer_phone === appt.customer_phone).length}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AVAILABILITY */}
          {tab === 'availability' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>שעות פעילות 🕐</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>הגדרי את הימים והשעות שבהם את עובדת</p>
              <div style={card}>
                {availability.map((day, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < 6 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: '80px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: day.is_active ? '#A11738' : '#9ca3af' }}>יום {DAY_NAMES[day.day_of_week]}</span>
                    </div>
                    <button onClick={async () => {
                        const newActive = !day.is_active;
                        setAvailability(prev => prev.map((d, j) => j === i ? { ...d, is_active: newActive } : d));
                        try {
                          await fetch(BACKEND + `/api/availability/${day.day_of_week}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') }, body: JSON.stringify({ start_time: day.start_time, end_time: day.end_time, is_active: newActive }) });
                          showToast(newActive ? '✅ יום הופעל' : '✅ יום כובה');
                        } catch(err) { showToast('שגיאה בשמירה'); }
                      }}
                      style={{ width: '40px', height: '20px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: day.is_active ? '#EC6A83' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', transition: 'left 0.2s', left: day.is_active ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                    {day.is_active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {['start_time', 'end_time'].map((field, fi) => (
                          <select key={field} value={day[field]}
                            onChange={async e => {
                              const val = e.target.value;
                              const newStart = field === 'start_time' ? val : day.start_time;
                              const newEnd   = field === 'end_time'   ? val : day.end_time;
                              setAvailability(prev => prev.map((d, j) => j === i ? { ...d, [field]: val } : d));
                              try {
                                await fetch(BACKEND + `/api/availability/${day.day_of_week}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') }, body: JSON.stringify({ start_time: newStart, end_time: newEnd, is_active: day.is_active }) });
                                showToast('✅ נשמר');
                              } catch(err) { showToast('שגיאה בשמירה'); }
                            }}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '0.875rem', cursor: 'pointer', background: 'white' }}>
                            {Array.from({ length: 33 }, (_, k) => { const tot = k * 30; const h = String(6 + Math.floor(tot / 60)).padStart(2, '0'); const m = tot % 60 === 0 ? '00' : '30'; return `${h}:${m}`; }).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        )).reduce((acc, el, idx) => idx === 0 ? [el] : [...acc, <span key="s" style={{ color: '#9ca3af', fontSize: '0.875rem' }}>עד</span>, el], [])}
                      </div>
                    ) : <span style={{ color: '#d1d5db', fontWeight: 700, fontSize: '0.875rem' }}>סגור</span>}
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '0.75rem', color: '#9ca3af', fontSize: '0.8rem' }}>השינויים נשמרים אוטומטית</p>
            </div>
          )}

          {/* PORTFOLIO */}
          {tab === 'portfolio' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.5rem' }}>תיק עבודות 🖼</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>תמונות שמוצגות ללקוחות</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem' }}>
                {PORTFOLIO.map(item => (
                  <div key={item.id} style={{ ...card, padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{item.emoji}</div>
                    <p style={{ fontWeight: 900, color: '#A11738', margin: '0 0 4px' }}>{item.title}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>בקרוב: אפשרות להעלות תמונות אמיתיות 📸</p>
            </div>
          )}

          {/* BOOKING PREVIEW */}
          {tab === 'booking' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setTab('overview')} style={{ padding: '8px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronR" className="w-5 h-5" /></button>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', margin: 0 }}>דף ההזמנות שלך</h1>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '2px 0 0' }}>authentic-wisdom-production.up.railway.app</p>
                </div>
              </div>
              <div style={{ border: '2px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
                <BookingPage onBack={() => setTab('overview')} onAppointmentBooked={(appt) => setAppointments(prev => [...prev, appt])} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="admin-bottom-nav" style={{ position: 'fixed', bottom: 0, right: 0, left: 0, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', borderTop: '1px solid rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 50, fontFamily: 'Varela Round, sans-serif' }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: tab === item.id ? '#A11738' : '#9ca3af', fontFamily: 'Varela Round, sans-serif', position: 'relative' }}>
            <Icon name={item.icon} className="w-5 h-5" />
            <span style={{ fontSize: '0.65rem', fontWeight: tab === item.id ? 900 : 500 }}>{item.label}</span>
            {item.id === 'pending' && pendingAppts.length > 0 && (
              <span style={{ position: 'absolute', top: '2px', right: '4px', background: '#EC6A83', color: 'white', fontSize: '0.55rem', fontWeight: 900, padding: '1px 5px', borderRadius: '999px' }}>{pendingAppts.length}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(BOOKING_KEY)) return 'booking';
      if (typeof window !== 'undefined' && window.location.pathname === '/admin') return 'auth';
    } catch(e) {}
    return 'portfolio';
  });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('https://booking-saas-production-b9fd.up.railway.app/api/appointments', {
      headers: { 'Authorization': 'Bearer ' + token }
    }).then(r => r.json()).then(data => { if (Array.isArray(data)) setAppointments(data); });
  }, [view]);

  if (typeof window === 'undefined') return null;
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&family=Dancing+Script:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Varela Round', sans-serif; background: linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%); min-height: 100vh; }
        ::selection { background: #F7C1C3; color: #A11738; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236,106,131,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(236,106,131,0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        .glass-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 8px 32px rgba(161,23,56,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
          border-radius: 24px;
        }

        .lux-btn {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #A11738, #EC6A83);
          color: #fff;
          font-family: 'Varela Round', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(161,23,56,0.3);
        }
        .lux-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(161,23,56,0.4); }

        .svc-card {
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 18px;
          border: 1.5px solid rgba(255,255,255,0.8);
          box-shadow: 0 4px 20px rgba(161,23,56,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.22s;
          cursor: pointer;
          width: 100%;
          text-align: right;
        }
        .svc-card:hover { border-color: rgba(247,193,195,0.7); box-shadow: 0 8px 32px rgba(236,106,131,0.16), inset 0 1px 0 rgba(255,255,255,1); transform: translateY(-2px); }
        .svc-card.selected { border-color: rgba(236,106,131,0.6); background: rgba(252,231,243,0.7); backdrop-filter: blur(20px); }

        .slot-btn {
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #A11738;
          font-family: 'Varela Round', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(161,23,56,0.07), inset 0 1px 0 rgba(255,255,255,0.9);
          transition: all 0.18s;
        }
        .slot-btn:hover { background: rgba(255,255,255,0.8); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(161,23,56,0.12); }
        .slot-btn.selected { background: linear-gradient(135deg,#A11738,#EC6A83); color: #fff; border-color: transparent; box-shadow: 0 4px 20px rgba(161,23,56,0.32); }

        .gallery-item {
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .gallery-item:hover { transform: scale(1.04) translateY(-4px); box-shadow: 0 16px 40px rgba(161,23,56,0.18); }
        .gallery-scroll::-webkit-scrollbar { display: none; }
        .reveal-sec { transition: opacity 0.7s ease, transform 0.7s ease; }

        @keyframes social-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 12px 48px rgba(161,23,56,0.1), inset 0 1px 0 rgba(255,255,255,1); }
          50% { transform: scale(1.018); box-shadow: 0 20px 60px rgba(161,23,56,0.16), inset 0 1px 0 rgba(255,255,255,1); }
        }
        .social-card-breathe { animation: social-breathe 4s ease-in-out infinite; }

        @keyframes sparkle-1 { 0%,100%{opacity:0.7;transform:scale(1) rotate(0deg)} 50%{opacity:0.2;transform:scale(1.4) rotate(20deg)} }
        @keyframes sparkle-2 { 0%,100%{opacity:0.5;transform:scale(1) rotate(0deg)} 50%{opacity:0.1;transform:scale(1.6) rotate(-15deg)} }
        @keyframes sparkle-3 { 0%,100%{opacity:0.5;transform:scale(1) rotate(0deg)} 50%{opacity:0.15;transform:scale(1.3) rotate(30deg)} }
        @keyframes sparkle-4 { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.5) rotate(-20deg)} }
        @keyframes sparkle-5 { 0%,100%{opacity:0.45;transform:scale(1)} 50%{opacity:0.1;transform:scale(1.4) rotate(25deg)} }
        .sp1 { animation: sparkle-1 3s ease-in-out infinite; color: #c4a35a; }
        .sp2 { animation: sparkle-2 2.5s ease-in-out infinite 0.4s; color: #EC6A83; }
        .sp3 { animation: sparkle-3 3.5s ease-in-out infinite 0.8s; color: #c4a35a; }
        .sp4 { animation: sparkle-4 4s ease-in-out infinite 0.2s; color: #EC6A83; }
        .sp5 { animation: sparkle-5 2.8s ease-in-out infinite 1s; color: #c4a35a; }

        @media (max-width: 480px) {
          .admin-stats-grid > div { padding: 0.875rem !important; }
          .admin-stats-grid > div p { font-size: 1.35rem !important; }
          .admin-stats-grid > div span { font-size: 0.7rem !important; }
          .admin-calendar-grid { grid-template-columns: 1fr !important; }
          .admin-customers-table .col-hide { display: none !important; }
          .admin-customers-table > div { grid-template-columns: 1fr 1fr !important; }
          .admin-bottom-nav button { padding: 4px 5px !important; }
          .admin-bottom-nav button span { font-size: 0.52rem !important; }
          .admin-bottom-nav button svg { width: 18px !important; height: 18px !important; }
        }
      `}</style>
      {view === 'portfolio' && <PortfolioPage onBook={() => setView('booking')} />}
      {view === 'booking' && <BookingPage onBack={() => setView('portfolio')} onAppointmentBooked={(appt) => { setAppointments(prev => [...prev, appt]); }} />}
      {view === 'auth' && <AuthScreen onLogin={(u) => { setUser(u); setView('dashboard'); }} />}
      {view === 'dashboard' && user && <Dashboard user={user} onLogout={() => { setUser(null); setView('portfolio'); }} appointments={appointments} setAppointments={setAppointments} />}
    </>
  );
}
