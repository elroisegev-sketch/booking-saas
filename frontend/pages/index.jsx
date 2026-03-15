import { useState, useRef, useEffect } from 'react';

const MOCK_USER = { id: '1', email: 'lior@beauty.com', business_name: 'ליאור שגב – היופי שלך', slug: 'lior-segev' };

const MOCK_SERVICES = [
  { id: 's1', name: 'מבנה אנטומי', duration: 60, price: 140, is_active: true, category: "לק ג'ל 💅" },
  { id: 's2', name: 'בניה חדשה', duration: 75, price: 250, is_active: true, category: "לק ג'ל 💅" },
  { id: 's3', name: 'הסרה + מניקור + צורה', duration: 45, price: 70, is_active: true, category: "לק ג'ל 💅" },
  { id: 's4', name: 'השלמת ציפורן', duration: 15, price: 10, is_active: true, category: "לק ג'ל 💅" },
  { id: 's5', name: "פרנץ'", duration: 15, price: 20, is_active: true, category: "לק ג'ל 💅" },
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
  { day_of_week: 0, is_active: false, start_time: '09:00', end_time: '18:00' },
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

💅🏽 התשלום מתבצע בסיום הטיפול במזומן / פייבוקס / ביט 🎀

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
const fmtPrice = (n) => `₪${parseFloat(n).toFixed(0)}`;

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
    await new Promise(r => setTimeout(r, 400));
    if (password === 'elroi7163') onLogin(MOCK_USER);
    else setError('סיסמה שגויה');
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Varela Round, sans-serif', background: '#FDECE5', backgroundImage: 'url(/pattern-pink.png)', backgroundSize: '150px' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 32px rgba(161,23,56,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo-pink.png" alt="Lior Segev" style={{ height: '60px', objectFit: 'contain', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#A11738', margin: 0 }}>כניסה לניהול 🎀</h2>
          </div>
          <form onSubmit={handle}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>סיסמה</label>
              <input type="password" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '12px', border: '1.5px solid #F7C1C3', outline: 'none', fontSize: '0.875rem', direction: 'ltr', boxSizing: 'border-box' }}
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: loading ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'רגע...' : 'כניסה'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
// ── TERMS SCREEN ──────────────────────────────────────────────
const TermsScreen = ({ termsText, onAccept, onBack }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: '#FDECE5', fontFamily: 'Varela Round, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
    <div style={{ width: '100%', maxWidth: '520px' }}>
      <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ background: 'linear-gradient(135deg,#A11738,#EC6A83)', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
          <h2 style={{ fontWeight: 900, fontSize: '1.5rem', margin: 0 }}>תקנון</h2>
          <p style={{ opacity: 0.7, fontSize: '0.875rem', marginTop: '4px' }}>יש לקרוא ולאשר לפני קביעת התור</p>
        </div>
        <div style={{ padding: '1.5rem', maxHeight: '380px', overflowY: 'auto' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, fontFamily: 'Varela Round, sans-serif' }}>{termsText}</pre>
        </div>
        <div style={{ padding: '1.25rem', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '12px' }}>
          <button onClick={onBack} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
          <button onClick={onAccept} style={{ flex: 2, padding: '0.875rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            קראתי ומאשרת ✅
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── BOOKING PAGE ──────────────────────────────────────────────
const BookingPage = ({ onBack, onAppointmentBooked }) => {
  // steps: 0=terms, 1=services, 2=date, 3=time, 4=details, 5=payment
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sel, setSel] = useState({ date: null, time: null, name: '', phone: '', image: null });
  const [calMonth, setCalMonth] = useState(new Date());
  const [booked, setBooked] = useState(false);
  const fileRef = useRef();

  const hasGel = selectedServices.some(s => s.category && s.category.includes("לק ג'ל"));
  const totalPrice = selectedServices.reduce((s, svc) => s + svc.price, 0);
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
    const dow = date.getDay();
    const a = MOCK_AVAILABILITY.find(x => x.day_of_week === dow);
    return a && a.is_active && date >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const slots = () => {
    if (!sel.date || selectedServices.length === 0) return [];
    const a = MOCK_AVAILABILITY.find(x => x.day_of_week === sel.date.getDay());
    if (!a || !a.is_active) return [];
    const [sh, sm] = a.start_time.split(':').map(Number);
    const [eh, em] = a.end_time.split(':').map(Number);
    const dur = totalDuration || 60;
    const res = [];
    for (let m = sh * 60 + sm; m + dur <= eh * 60 + em; m += 30) {
      const d = new Date(sel.date.getFullYear(), sel.date.getMonth(), sel.date.getDate(), Math.floor(m / 60), m % 60);
      if (d > new Date()) res.push(`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);
    }
    return res;
  };

  const cats = [...new Set(MOCK_SERVICES.map(s => s.category))];
  const S = { fontFamily: 'Varela Round, sans-serif' };
  const btn = (active) => ({ padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', border: `2px solid ${active ? '#EC6A83' : '#f0f0f0'}`, background: active ? 'linear-gradient(135deg,#A11738,#EC6A83)' : 'white', color: active ? 'white' : '#A11738', cursor: 'pointer' });

  const dateStr = sel.date?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  const serviceNames = selectedServices.map(s => s.name).join(', ');
  const deposit = Math.ceil(totalPrice / 2);
  const waLink = WHATSAPP_LINK(sel.name, serviceNames, dateStr, sel.time, totalPrice);

  if (booked) return (
    <div dir="rtl" style={{ ...S, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDECE5' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', padding: '2rem', width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏳</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#A11738', marginBottom: '0.5rem' }}>הבקשה נשלחה!</h2>
        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.875rem' }}>
          התור <strong>ממתין לאישור</strong> מאת ליאור 🌸<br />
          תקבלי הודעה בוואטסאפ ברגע שיאושר
        </p>
        <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.25rem', textAlign: 'right', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#A11738', marginBottom: '4px' }}>{serviceNames}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{dateStr} | {sel.time}</p>
          <p style={{ fontWeight: 900, fontSize: '1.5rem', color: '#EC6A83', marginTop: '0.5rem' }}>{fmtPrice(totalPrice)}</p>
        </div>
        <a href={waLink} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '0.875rem', borderRadius: '12px', background: '#25D366', color: 'white', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', marginBottom: '12px', boxSizing: 'border-box' }}>
          <Icon name="whatsapp" className="w-5 h-5" />
          שלחי הודעה לליאור בוואטסאפ
        </a>
        <button onClick={onBack} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );

  if (step === 0) return <TermsScreen termsText={TERMS_GENERAL} onAccept={() => setStep(1)} onBack={onBack} />;

  return (
    <div dir="rtl" style={{ ...S, minHeight: '100vh', background: '#FDECE5' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={onBack} style={{ padding: '0.5rem', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon name="chevronR" className="w-5 h-5" />
        </button>
        <img src="/symbol.png" alt="LS" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <div>
          <p style={{ fontWeight: 900, color: '#A11738', margin: 0 }}>ליאור שגב – היופי שלך</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>קביעת תור</p>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, background: step >= s ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#f3f4f6', color: step >= s ? 'white' : '#9ca3af' }}>{s}</div>
              {s < 4 && <div style={{ width: '12px', height: '2px', background: step > s ? '#EC6A83' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Step 1 - Services (multi-select) */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>בחרי שירותים</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>ניתן לבחור מספר שירותים</p>
            {cats.map(cat => (
              <div key={cat} style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#EC6A83', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{cat}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {MOCK_SERVICES.filter(s => s.category === cat).map(svc => {
                    const isSelected = selectedServices.find(s => s.id === svc.id);
                    return (
                      <button key={svc.id} onClick={() => toggleService(svc)}
                        style={{ background: isSelected ? 'linear-gradient(135deg,#fdf2f8,#F7C1C3)' : 'white', border: `2px solid ${isSelected ? '#EC6A83' : '#f0f0f0'}`, borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? '#EC6A83' : '#d1d5db'}`, background: isSelected ? '#EC6A83' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isSelected && <svg width="10" height="8" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#A11738', margin: 0, fontSize: '0.9rem' }}>{svc.name}</p>
                            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 0' }}>{svc.duration} דקות</p>
                          </div>
                        </div>
                        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#EC6A83' }}>{fmtPrice(svc.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Summary bar */}
            {selectedServices.length > 0 && (
              <div style={{ position: 'sticky', bottom: '1rem', background: 'white', border: '2px solid #EC6A83', borderRadius: '16px', padding: '1rem', marginTop: '1rem', boxShadow: '0 4px 20px rgba(139,34,82,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#A11738', fontSize: '0.875rem' }}>{selectedServices.length} שירות{selectedServices.length > 1 ? 'ים' : ''} נבחר{selectedServices.length > 1 ? 'ו' : ''}</span>
                  <span style={{ fontWeight: 900, color: '#EC6A83', fontSize: '1.1rem' }}>סה"כ: {fmtPrice(totalPrice)}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px' }}>
                  {selectedServices.map(s => s.name).join(' + ')} · {totalDuration} דקות
                </div>
                <button onClick={() => {
                  if (hasGel) {
                    // Show gel terms before proceeding
                    setStep('terms_gel');
                  } else {
                    setStep(2);
                  }
                }} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  המשך לבחירת תאריך →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gel terms interstitial */}
        {step === 'terms_gel' && (
          <TermsScreen termsText={TERMS_GEL} onAccept={() => setStep(2)} onBack={() => setStep(1)} />
        )}

        {/* Step 2 - Date */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>בחרי תאריך</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{selectedServices.map(s => s.name).join(' + ')}</p>
            <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronR" className="w-4 h-4" /></button>
                <span style={{ fontWeight: 700, color: '#A11738' }}>{calMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronL" className="w-4 h-4" /></button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '8px' }}>
                  {['א','ב','ג','ד','ה','ו','ש'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', padding: '4px' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '4px' }}>
                  {Array.from({ length: getFD(calMonth.getFullYear(), calMonth.getMonth()) }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: getDIM(calMonth.getFullYear(), calMonth.getMonth()) }, (_, i) => {
                    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), i + 1);
                    const av = isAvail(d);
                    const isSel = sel.date && d.toDateString() === sel.date.toDateString();
                    return (
                      <button key={i} onClick={() => av && setSel({ ...sel, date: d })} disabled={!av}
                        style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: av ? 'pointer' : 'not-allowed', background: isSel ? 'linear-gradient(135deg,#A11738,#EC6A83)' : av ? '#FDECE5' : 'transparent', color: isSel ? 'white' : av ? '#A11738' : '#d1d5db' }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={() => sel.date && setStep(3)} disabled={!sel.date} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: sel.date ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: sel.date ? 'pointer' : 'not-allowed' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 3 - Time */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>בחרי שעה</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{sel.date?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '1.5rem' }}>
              {slots().map(s => (
                <button key={s} onClick={() => setSel({ ...sel, time: s })} style={btn(sel.time === s)}>{s}</button>
              ))}
              {slots().length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>אין שעות פנויות</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={() => sel.time && setStep(4)} disabled={!sel.time} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: sel.time ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: sel.time ? 'pointer' : 'not-allowed' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 4 - Details */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>פרטים אישיים</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>עוד צעד קטן 🌸</p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>שם מלא *</label>
              <input style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box' }}
                placeholder="שם מלא" value={sel.name} onChange={e => setSel({ ...sel, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>מספר טלפון *</label>
              <input style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'ltr', boxSizing: 'border-box', textAlign: 'right' }}
                placeholder="050-0000000" value={sel.phone} onChange={e => setSel({ ...sel, phone: e.target.value })} />
            </div>

            {hasGel && (
              <div style={{ marginBottom: '1.25rem', background: '#FDECE5', border: '2px dashed #f0d0e0', borderRadius: '12px', padding: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EC6A83', marginBottom: '4px' }}>💅 רוצה להעלות השראה?</p>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.75rem' }}>העלי תמונה שתעזור לליאור להכין את העיצוב המושלם</p>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = ev => setSel({ ...sel, image: ev.target.result });
                      reader.readAsDataURL(file);
                    }
                  }} />
                {sel.image ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={sel.image} alt="inspiration" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #EC6A83' }} />
                    <button onClick={() => setSel({ ...sel, image: null })} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1rem', borderRadius: '10px', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                    <Icon name="image" className="w-4 h-4" /> העלי תמונה
                  </button>
                )}
              </div>
            )}

            <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, color: '#EC6A83', fontSize: '0.875rem', marginBottom: '0.75rem' }}>סיכום הזמנה</p>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>{svc.name}</span>
                  <span style={{ color: '#EC6A83', fontWeight: 700, fontSize: '0.875rem' }}>{fmtPrice(svc.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 900, color: '#A11738' }}>סה"כ</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#EC6A83' }}>{fmtPrice(totalPrice)}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '8px' }}>{dateStr} | {sel.time} · {totalDuration} דקות</p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={() => (sel.name && sel.phone) && setStep(5)}
                disabled={!sel.name || !sel.phone}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: (sel.name && sel.phone) ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: (sel.name && sel.phone) ? 'pointer' : 'not-allowed' }}>
                המשך לתשלום 💳
              </button>
            </div>
          </div>
        )}

        {/* Step 5 - Payment */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#A11738', marginBottom: '0.25rem' }}>תשלום מקדמה</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>יש להעביר מקדמה לאישור התור 🌸</p>

            <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
              {selectedServices.map(svc => (
                <div key={svc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#374151', fontSize: '0.875rem' }}>{svc.name}</span>
                  <span style={{ color: '#EC6A83', fontWeight: 700, fontSize: '0.875rem' }}>{fmtPrice(svc.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 900, color: '#A11738' }}>סה"כ</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#EC6A83' }}>{fmtPrice(totalPrice)}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '6px' }}>{dateStr} | {sel.time}</p>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.875rem', color: '#92400e' }}>
              <strong>⚠️ שימי לב:</strong> התור יאושר רק לאחר שליאור תראה את ההעברה ותאשר ידנית.
            </div>

            <div style={{ background: '#F7C1C3', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#A11738', fontWeight: 700 }}>
              💳 יש להעביר מקדמה דרך ביט / פייבוקס למספר:<br />
              <span style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>053-524-9688</span>
            </div>

            <a href={waLink} target="_blank" rel="noreferrer" onClick={() => setBooked(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "0.875rem", borderRadius: "12px", background: "#25D366", color: "white", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", marginBottom: "12px", boxSizing: "border-box" }}><Icon name="whatsapp" className="w-5 h-5" />שלחי הודעה לליאור לאישור התור</a>

            <button onClick={() => setStep(4)} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', fontFamily: 'Varela Round, sans-serif' }}>
      <div dir="rtl" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.25rem', margin: 0 }}>{service ? 'עריכת שירות' : 'שירות חדש'}</h2>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" className="w-5 h-5" /></button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>שם השירות</label>
          <input style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box' }}
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>קטגוריה</label>
          <select style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box' }}
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>לק ג&apos;ל 💅</option>
            <option>פנים 💆</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>משך (דקות)</label>
            <input type="number" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
              value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>מחיר (₪)</label>
            <input type="number" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }}
              value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>ביטול</button>
          <button onClick={() => form.name && onSave(form)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: form.name ? 'linear-gradient(135deg,#A11738,#EC6A83)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: form.name ? 'pointer' : 'not-allowed' }}>
            {service ? 'שמירה' : 'הוספה'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── PORTFOLIO PAGE ────────────────────────────────────────────
const PortfolioPage = ({ onBook, onAdmin }) => (
  <div dir="rtl" style={{ minHeight: '100vh', fontFamily: 'Varela Round, sans-serif', background: '#FDECE5', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

    {/* Hero */}
    <div style={{ width: '100%', background: 'linear-gradient(170deg,#A11738 0%,#EC6A83 100%)', backgroundImage: 'url(/pattern-pink.png)', backgroundSize: '180px', backgroundBlendMode: 'soft-light', padding: '2rem 1rem 3rem', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,rgba(161,23,56,0.88),rgba(236,106,131,0.78))' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <img src="/logo-white.png" alt="Lior Segev" style={{ height: '55px', objectFit: 'contain', marginBottom: '0.5rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem', marginBottom: '1.5rem', letterSpacing: '0.08em' }}>יופי מקצועי • ליד הבית שלך</p>
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <img src="/lior.png" alt="ליאור שגב" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>
      </div>
    </div>

    {/* Content card */}
    <div style={{ width: '100%', maxWidth: '420px', padding: '1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* CTA */}
      <button onClick={onBook} style={{ width: '100%', padding: '0.9rem', borderRadius: '999px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 900, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(161,23,56,0.3)', fontFamily: 'Varela Round, sans-serif' }}>
        💅 קביעת תור עכשיו
      </button>

      {/* Gallery */}
      <div>
        <p style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', color: '#A11738', marginBottom: '0.75rem' }}>תיק עבודות ✨</p>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', display: 'flex', gap: '0.625rem', paddingBottom: '0.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.gallery-scroll::-webkit-scrollbar { display: none; }`}</style>
          {Array.from({length: 21}, (_, i) => i + 1).map(n => (
            <div key={n} style={{ flexShrink: 0, width: '140px', height: '170px', borderRadius: '14px', overflow: 'hidden', scrollSnapAlign: 'start', boxShadow: '0 2px 12px rgba(161,23,56,0.1)' }}>
              <img src={`/gallery/1 - ${n}.jpeg`} alt={`עבודה ${n}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Social */}
      <div style={{ background: 'white', border: '1.5px solid #F7C1C3', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
        <p style={{ fontWeight: 900, color: '#A11738', fontSize: '0.9rem', margin: '0 0 0.25rem' }}>Lior Segev Beauty</p>
        <p style={{ color: '#9ca3af', fontSize: '0.68rem', margin: '0 0 0.75rem' }}>עקבי אחרינו ברשתות</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="https://www.instagram.com/liors_beauty" target="_blank" rel="noreferrer">
            <img src="/instagram.png" alt="Instagram" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </a>
          <a href="https://www.facebook.com/share/1DLKLrkWFb/" target="_blank" rel="noreferrer">
            <img src="/facebook.png" alt="Facebook" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button onClick={onAdmin} style={{ color: '#d1d5db', fontSize: '0.68rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          כניסה לניהול
        </button>
      </div>
    </div>
  </div>
);

// ── DASHBOARD ─────────────────────────────────────────────────
const Dashboard = ({ user, onLogout, appointments: initialAppointments, setAppointments: setParentAppointments }) => {
  const [appointments, setAppointmentsState] = useState(() => {
    try {
      const saved = localStorage.getItem('lior_appointments');
      return saved ? JSON.parse(saved) : initialAppointments;
    } catch { return initialAppointments; }
  });

  const setAppointments = (val) => {
    const next = typeof val === 'function' ? val(appointments) : val;
    setAppointmentsState(next);
    try { localStorage.setItem('lior_appointments', JSON.stringify(next)); } catch {}
  };
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
  const [newAppt, setNewAppt] = useState({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '' });

  const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://booking-saas-production-b9fd.up.railway.app';
  const VAPID_PUBLIC = 'BJruLIZOsClN97fYdg9i5G52FyTQGEVD_5pSAW6BWQNPKO5lecZhhOn58DCnS1aEkPX1qWQIKcA9INApaRiW1X0';

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

  const approveAppt = (id) => { setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a)); showToast('התור אושר ✅'); };
  const cancelAppt = (id) => { setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)); showToast('התור בוטל'); };

  const addManualAppt = () => {
    if (!newAppt.customer_name || !newAppt.date || !newAppt.time) return;
    const dt = new Date(newAppt.date + 'T' + newAppt.time);
    const appt = {
      id: 'manual_' + Date.now(),
      customer_name: newAppt.customer_name,
      service_name: newAppt.service_name || 'טיפול',
      appointment_time: dt.toISOString(),
      status: 'confirmed',
      price: parseFloat(newAppt.price) || 0,
      deposit: parseFloat(newAppt.deposit) || 0,
    };
    setAppointments([...appointments, appt]);
    setNewAppt({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '' });
    setShowAddAppt(false);
    showToast('התור נוסף ✅');
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

  const mainStyle = { flex: 1, overflowY: 'auto', fontFamily: 'Varela Round, sans-serif', background: '#FDECE5', paddingBottom: '80px' };
  const card = { background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px' };

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {toast && <div style={{ position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#A11738', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Varela Round, sans-serif' }}>{toast}</div>}

      {viewImage && (
        <div onClick={() => setViewImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <img src={viewImage} alt="inspiration" style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '16px' }} />
        </div>
      )}

      {/* Top Header */}
      <div style={{ background: 'linear-gradient(135deg,#A11738,#EC6A83)', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/symbol.png" alt="LS" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem', fontFamily: 'Varela Round, sans-serif' }}>ליאור שגב</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTab('booking')} style={{ padding: '6px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>🔗 הזמנות</button>
          <button onClick={onLogout} style={{ padding: '6px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.75rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>יציאה</button>
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
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⏳</span>
                  <div>
                    <p style={{ fontWeight: 900, color: '#92400e', margin: 0 }}>{pendingAppts.length} תורים ממתינים לאישור!</p>
                    <button onClick={() => setTab('pending')} style={{ color: '#b45309', fontWeight: 700, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>לחצי לאישור ←</button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
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
                  {appt.image && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '4px' }}>השראה שהלקוחה העלתה:</p>
                      <img src={appt.image} alt="inspiration" onClick={() => setViewImage(appt.image)} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #F7C1C3', cursor: 'pointer' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
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
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', fontFamily: 'Varela Round, sans-serif' }}>
              <div dir="rtl" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 style={{ fontWeight: 900, color: '#A11738', fontSize: '1.25rem', margin: 0 }}>הוסף תור ידני</h2>
                  <button onClick={() => setShowAddAppt(false)} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" className="w-5 h-5" /></button>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: '#374151', marginBottom: '4px' }}>הדביקי את הודעת הוואטסאפ של הלקוחה 📋</label>
                  <textarea
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #F7C1C3', outline: 'none', fontSize: '0.8rem', direction: 'rtl', boxSizing: 'border-box', minHeight: '160px', resize: 'vertical', fontFamily: 'Varela Round, sans-serif', lineHeight: 1.6 }}
                    placeholder={"היי ליאור 🌸\nקבעתי תור!\nשם: ...\nשירותים: ...\nתאריך: ... בשעה ...\nסה״כ: ₪...\nמקדמה לשריין: ₪..."}
                    value={newAppt.rawText || ''}
                    onChange={e => {
                      const text = e.target.value;
                      const nameMatch = text.match(/שם[:\s]+([^\n]+)/);
                      const serviceMatch = text.match(/שירותים[:\s]+([^\n]+)/);
                      const dateMatch = text.match(/תאריך[:\s]+([^\n]+)\s+בשעה\s+(\d{1,2}:\d{2})/);
                      const totalMatch = text.match(/סה[״"]כ[:\s]*₪?(\d+)/);
                      const depositMatch = text.match(/מקדמה[^:]*[:\s]*₪?(\d+)/);
                      
                      let parsedDate = '';
                      if (dateMatch) {
                        const hebrewDate = dateMatch[1].trim();
                        const months = { 'ינואר': '01', 'פברואר': '02', 'מרץ': '03', 'אפריל': '04', 'מאי': '05', 'יוני': '06', 'יולי': '07', 'אוגוסט': '08', 'ספטמבר': '09', 'אוקטובר': '10', 'נובמבר': '11', 'דצמבר': '12' };
                        const dayMonthMatch = hebrewDate.match(/(\d{1,2})\s+ב?(\S+)/);
                        if (dayMonthMatch) {
                          const day = dayMonthMatch[1].padStart(2, '0');
                          const monthName = dayMonthMatch[2].replace('ב','');
                          const monthNum = months[monthName] || months[Object.keys(months).find(k => monthName.includes(k))];
                          if (monthNum) parsedDate = `${new Date().getFullYear()}-${monthNum}-${day}`;
                        }
                      }
                      
                      setNewAppt({
                        ...newAppt,
                        rawText: text,
                        customer_name: nameMatch ? nameMatch[1].trim() : newAppt.customer_name,
                        service_name: serviceMatch ? serviceMatch[1].trim() : newAppt.service_name,
                        date: parsedDate || newAppt.date,
                        time: dateMatch ? dateMatch[2] : newAppt.time,
                        price: totalMatch ? totalMatch[1] : newAppt.price,
                        deposit: depositMatch ? depositMatch[1] : newAppt.deposit,
                      });
                    }}
                  />
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
                  <button onClick={() => { setShowAddAppt(false); setNewAppt({ customer_name: '', service_name: '', date: '', time: '', deposit: '', price: '', rawText: '' }); }} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>ביטול</button>
                  <button onClick={addManualAppt} disabled={!newAppt.customer_name || !newAppt.date || !newAppt.time} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: (!newAppt.customer_name || !newAppt.date || !newAppt.time) ? '#d1d5db' : 'linear-gradient(135deg,#A11738,#EC6A83)', color: 'white', fontWeight: 700, border: 'none', cursor: (!newAppt.customer_name || !newAppt.date || !newAppt.time) ? 'not-allowed' : 'pointer' }}>
                    שריין ביומן ✅
                  </button>
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
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
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
                        const hasA = appointments.some(a => new Date(a.appointment_time).toDateString() === d.toDateString() && a.status !== 'cancelled');
                        const isSel = d.toDateString() === selDay.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        return (
                          <button key={i} onClick={() => setSelDay(d)}
                            style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', position: 'relative', background: isSel ? 'linear-gradient(135deg,#A11738,#EC6A83)' : isToday ? '#F7C1C3' : 'transparent', color: isSel ? 'white' : '#A11738' }}>
                            {i + 1}
                            {hasA && <div style={{ position: 'absolute', bottom: '3px', width: '6px', height: '6px', borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : '#EC6A83' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={card}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f9fafb' }}>
                    <p style={{ fontWeight: 900, color: '#A11738', margin: 0, fontSize: '0.875rem' }}>{selDay.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  </div>
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
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {appt.image && <img src={appt.image} alt="ins" onClick={() => setViewImage(appt.image)} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }} />}
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
                            <button onClick={() => { setServices(services.map(s => s.id === svc.id ? { ...s, is_active: false } : s)); showToast('השירות הוסר'); }} style={{ padding: '5px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="trash" className="w-4 h-4" /></button>
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
              {showModal && <ServiceModal service={editSvc} onSave={(data) => { if (editSvc) { setServices(services.map(s => s.id === editSvc.id ? { ...s, ...data } : s)); showToast('השירות עודכן ✅'); } else { setServices([...services, { id: `s${Date.now()}`, ...data, is_active: true }]); showToast('השירות נוסף ✅'); } setShowModal(false); }} onClose={() => setShowModal(false)} />}
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                    {['שם', 'טלפון', 'ביקור אחרון', 'תורים'].map(h => <span key={h} style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af' }}>{h}</span>)}
                  </div>
                  {[...new Map(appointments.filter(a => a.status !== 'cancelled').map(a => [a.customer_phone, a])).values()].map((appt, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '1rem 1.5rem', alignItems: 'center', borderBottom: '1px solid #fafafa' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 900, background: '#F7C1C3', color: '#A11738', flexShrink: 0 }}>{appt.customer_name[0]}</div>
                        <span style={{ fontWeight: 700, color: '#A11738', fontSize: '0.875rem' }}>{appt.customer_name}</span>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{appt.customer_phone}</span>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{fmtDate(appt.appointment_time)}</span>
                      <span style={{ fontWeight: 900, color: '#EC6A83', fontSize: '0.875rem' }}>{appointments.filter(a => a.customer_phone === appt.customer_phone).length}</span>
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
                    <button onClick={() => setAvailability(availability.map((d, j) => j === i ? { ...d, is_active: !d.is_active } : d))}
                      style={{ width: '40px', height: '20px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: day.is_active ? '#EC6A83' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', transition: 'left 0.2s', left: day.is_active ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                    {day.is_active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="time" value={day.start_time} onChange={e => setAvailability(availability.map((d, j) => j === i ? { ...d, start_time: e.target.value } : d))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }} />
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>עד</span>
                        <input type="time" value={day.end_time} onChange={e => setAvailability(availability.map((d, j) => j === i ? { ...d, end_time: e.target.value } : d))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }} />
                      </div>
                    ) : <span style={{ color: '#d1d5db', fontWeight: 700, fontSize: '0.875rem' }}>סגור</span>}
                  </div>
                ))}
              </div>
              <button onClick={() => showToast('שעות הפעילות נשמרו ✅')} style={{ marginTop: '1rem', padding: '0.875rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg,#A11738,#EC6A83)', color: '#F7C1C3', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Varela Round, sans-serif' }}>
                שמירת שינויים
              </button>
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
    </div>
  );
};

// ── ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('portfolio');
  const [appointments, setAppointments] = useState([]);

  if (typeof window === 'undefined') return null;
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Varela Round', sans-serif; }`}</style>
      {view === 'portfolio' && <PortfolioPage onBook={() => setView('booking')} onAdmin={() => setView('auth')} />}
      {view === 'booking' && <BookingPage onBack={() => setView('portfolio')} onAppointmentBooked={(appt) => { setAppointments(prev => [...prev, appt]); }} />}
      {view === 'auth' && <AuthScreen onLogin={(u) => { setUser(u); setView('dashboard'); }} />}
      {view === 'dashboard' && user && <Dashboard user={user} onLogout={() => { setUser(null); setView('portfolio'); }} appointments={appointments} setAppointments={setAppointments} />}
    </>
  );
}
