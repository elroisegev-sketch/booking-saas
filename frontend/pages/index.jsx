import { useState } from 'react';

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

const today = new Date();
const MOCK_APPOINTMENTS = [
  { id: 'a1', customer_name: 'מיכל כהן', customer_phone: '050-1234567', service_name: 'מבנה אנטומי', appointment_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(), status: 'confirmed', price: 140 },
  { id: 'a2', customer_name: 'שירה לוי', customer_phone: '052-9876543', service_name: 'הרמת ריסים', appointment_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(), status: 'confirmed', price: 200 },
  { id: 'a3', customer_name: 'נועה אברהם', customer_phone: '054-1112222', service_name: 'עיצוב + צביעת גבות', appointment_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).toISOString(), status: 'completed', price: 80 },
  { id: 'a4', customer_name: 'רונית משה', customer_phone: '058-3334444', service_name: 'בניה חדשה', appointment_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0).toISOString(), status: 'confirmed', price: 250 },
  { id: 'a5', customer_name: 'דנה פרץ', customer_phone: '050-5556666', service_name: 'הרמת גבות', appointment_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0).toISOString(), status: 'confirmed', price: 200 },
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
    star: <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
  };
  return icons[name] || null;
};

// ── AUTH ──────────────────────────────────────────────────────
const AuthScreen = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', business_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (mode === 'login') {
      if (form.email === 'lior@beauty.com' && form.password === 'demo1234') onLogin(MOCK_USER);
      else setError('פרטים שגויים. נסי: lior@beauty.com / demo1234');
    } else {
      if (!form.business_name || !form.email || !form.password) setError('יש למלא את כל השדות');
      else onLogin({ ...MOCK_USER, email: form.email, business_name: form.business_name });
    }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Heebo, sans-serif', background: '#fdf8f5' }}>
      <div style={{ display: 'none' }} className="lg:flex lg:w-1/2" />
      {/* Left panel */}
      <div style={{ width: '50%', background: 'linear-gradient(145deg,#2d0a1e,#8b2252)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💅</div>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem' }}>
          היופי שלך,<br /><span style={{ color: '#ffb6c1' }}>בקליק אחד</span>
        </h1>
        <p style={{ opacity: 0.7, fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          קביעת תורים פשוטה ונוחה לשירותי יופי מקצועיים
        </p>
        {['לק ג׳ל ועיצוב ציפורניים', 'הרמת ריסים וגבות', 'עיצוב וצביעת גבות'].map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#ffb6c1' }}>✨</span>
            <span style={{ opacity: 0.85 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.5rem' }}>
            {mode === 'login' ? 'ברוכה הבאה 👋' : 'יצירת חשבון'}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {mode === 'login' ? 'התחברי לדשבורד שלך' : 'פתיחת עסק חדש'}
          </p>
          {mode === 'login' && (
            <div style={{ background: 'rgba(255,182,193,0.2)', border: '1px solid rgba(255,105,180,0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#8b2252', marginBottom: '1.5rem' }}>
              <strong>דמו:</strong> lior@beauty.com / demo1234
            </div>
          )}
          <form onSubmit={handle}>
            {mode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>שם העסק</label>
                <input style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'rtl', boxSizing: 'border-box' }}
                  placeholder="ליאור שגב – היופי שלך" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>אימייל</label>
              <input type="email" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'ltr', boxSizing: 'border-box' }}
                placeholder="lior@beauty.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#374151', marginBottom: '0.25rem' }}>סיסמה</label>
              <input type="password" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem', direction: 'ltr', boxSizing: 'border-box' }}
                placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', background: loading ? '#9ca3af' : 'linear-gradient(135deg,#2d0a1e,#8b2252)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
              {loading ? 'רגע...' : mode === 'login' ? 'כניסה' : 'יצירת חשבון'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            {mode === 'login' ? 'אין לך חשבון? ' : 'יש לך חשבון? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ color: '#8b2252', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
              {mode === 'login' ? 'הירשמי' : 'כניסה'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ── BOOKING PAGE ──────────────────────────────────────────────
const BookingPage = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ service: null, date: null, time: null, name: '', phone: '' });
  const [calMonth, setCalMonth] = useState(new Date());
  const [booked, setBooked] = useState(false);

  const getDIM = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFD = (y, m) => new Date(y, m, 1).getDay();

  const isAvail = (date) => {
    const dow = date.getDay();
    const a = MOCK_AVAILABILITY.find(x => x.day_of_week === dow);
    return a && a.is_active && date >= new Date(new Date().setHours(0, 0, 0, 0));
  };

  const slots = () => {
    if (!sel.date || !sel.service) return [];
    const a = MOCK_AVAILABILITY.find(x => x.day_of_week === sel.date.getDay());
    if (!a || !a.is_active) return [];
    const [sh, sm] = a.start_time.split(':').map(Number);
    const [eh, em] = a.end_time.split(':').map(Number);
    const dur = sel.service.duration;
    const res = [];
    for (let m = sh * 60 + sm; m + dur <= eh * 60 + em; m += dur) {
      const d = new Date(sel.date.getFullYear(), sel.date.getMonth(), sel.date.getDate(), Math.floor(m / 60), m % 60);
      if (d > new Date()) res.push(`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`);
    }
    return res;
  };

  const cats = [...new Set(MOCK_SERVICES.map(s => s.category))];
  const S = { fontFamily: 'Heebo, sans-serif' };
  const btn = (active) => ({ padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', border: `2px solid ${active ? '#8b2252' : '#f0f0f0'}`, background: active ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : 'white', color: active ? 'white' : '#2d0a1e', cursor: 'pointer' });

  if (booked) return (
    <div dir="rtl" style={{ ...S, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f5' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💅</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.5rem' }}>התור נקבע!</h2>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>מחכים לך אצל <strong>ליאור שגב</strong> 🌸</p>
        <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.25rem', textAlign: 'right', marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2d0a1e', marginBottom: '0.25rem' }}>{sel.service?.name}</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{sel.date?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} | {sel.time}</p>
          <p style={{ fontWeight: 900, fontSize: '1.5rem', color: '#8b2252', marginTop: '0.75rem' }}>{fmtPrice(sel.service?.price)}</p>
        </div>
        <button onClick={onBack} style={{ padding: '0.875rem 2rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2d0a1e,#8b2252)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ ...S, minHeight: '100vh', background: '#fdf8f5' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={onBack} style={{ padding: '0.5rem', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon name="chevronR" className="w-5 h-5" />
        </button>
        <span style={{ fontSize: '1.5rem' }}>💅</span>
        <div>
          <p style={{ fontWeight: 900, color: '#2d0a1e', margin: 0 }}>ליאור שגב – היופי שלך</p>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>קביעת תור</p>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, background: step >= s ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : '#f3f4f6', color: step >= s ? 'white' : '#9ca3af' }}>{s}</div>
              {s < 4 && <div style={{ width: '12px', height: '2px', background: step > s ? '#8b2252' : '#e5e7eb' }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.25rem' }}>בחרי שירות</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>איזה שירות תרצי להזמין?</p>
            {cats.map(cat => (
              <div key={cat} style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 700, color: '#8b2252', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{cat}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {MOCK_SERVICES.filter(s => s.category === cat).map(svc => (
                    <button key={svc.id} onClick={() => { setSel({ ...sel, service: svc }); setStep(2); }}
                      style={{ background: 'white', border: `2px solid ${sel.service?.id === svc.id ? '#8b2252' : '#f0f0f0'}`, borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'right' }}>
                      <div>
                        <p style={{ fontWeight: 700, color: '#2d0a1e', margin: 0, fontSize: '0.9rem' }}>{svc.name}</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 0' }}>{svc.duration} דקות</p>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#8b2252' }}>{fmtPrice(svc.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.25rem' }}>בחרי תאריך</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>שירות: <strong>{sel.service?.name}</strong></p>
            <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronR" className="w-4 h-4" /></button>
                <span style={{ fontWeight: 700, color: '#2d0a1e' }}>{calMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
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
                        style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: av ? 'pointer' : 'not-allowed', background: isSel ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : av ? '#fdf8f5' : 'transparent', color: isSel ? 'white' : av ? '#2d0a1e' : '#d1d5db' }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={() => sel.date && setStep(3)} disabled={!sel.date} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: sel.date ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: sel.date ? 'pointer' : 'not-allowed' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.25rem' }}>בחרי שעה</h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{sel.date?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '1.5rem' }}>
              {slots().map(s => (
                <button key={s} onClick={() => setSel({ ...sel, time: s })} style={btn(sel.time === s)}>{s}</button>
              ))}
              {slots().length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>אין שעות פנויות</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={() => sel.time && setStep(4)} disabled={!sel.time} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: sel.time ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: sel.time ? 'pointer' : 'not-allowed' }}>המשך</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.25rem' }}>פרטים אישיים</h2>
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
            <div style={{ background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, color: '#8b2252', fontSize: '0.875rem', marginBottom: '0.75rem' }}>סיכום</p>
              <p style={{ fontWeight: 700, color: '#2d0a1e', marginBottom: '4px' }}>{sel.service?.name}</p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{sel.date?.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })} | {sel.time}</p>
              <p style={{ fontWeight: 900, fontSize: '1.5rem', color: '#8b2252', marginTop: '0.5rem' }}>{fmtPrice(sel.service?.price)}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 700, border: 'none', cursor: 'pointer' }}>חזרה</button>
              <button onClick={async () => { await new Promise(r => setTimeout(r, 500)); setBooked(true); }}
                disabled={!sel.name || !sel.phone}
                style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: (sel.name && sel.phone) ? 'linear-gradient(135deg,#8b2252,#e91e8c)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: (sel.name && sel.phone) ? 'pointer' : 'not-allowed' }}>
                אישור תור 🌸
              </button>
            </div>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', fontFamily: 'Heebo, sans-serif' }}>
      <div dir="rtl" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 900, color: '#2d0a1e', fontSize: '1.25rem', margin: 0 }}>{service ? 'עריכת שירות' : 'שירות חדש'}</h2>
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
          <button onClick={() => form.name && onSave(form)} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', background: form.name ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : '#d1d5db', color: 'white', fontWeight: 700, border: 'none', cursor: form.name ? 'pointer' : 'not-allowed' }}>
            {service ? 'שמירה' : 'הוספה'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DASHBOARD ─────────────────────────────────────────────────
const Dashboard = ({ user, onLogout }) => {
  const [tab, setTab] = useState('overview');
  const [appointments] = useState(MOCK_APPOINTMENTS);
  const [services, setServices] = useState(MOCK_SERVICES);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);
  const [showModal, setShowModal] = useState(false);
  const [editSvc, setEditSvc] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selDay, setSelDay] = useState(new Date());
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const todayAppts = appointments.filter(a => new Date(a.appointment_time).toDateString() === new Date().toDateString() && a.status !== 'cancelled');
  const revenue = todayAppts.reduce((s, a) => s + (a.price || 0), 0);
  const upcoming = appointments.filter(a => new Date(a.appointment_time) > new Date() && a.status !== 'cancelled').length;
  const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const navItems = [
    { id: 'overview', label: 'סקירה', icon: 'home' },
    { id: 'calendar', label: 'יומן', icon: 'calendar' },
    { id: 'services', label: 'שירותים', icon: 'sparkles' },
    { id: 'customers', label: 'לקוחות', icon: 'users' },
    { id: 'availability', label: 'שעות', icon: 'clock' },
  ];

  const sidebarStyle = { width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#2d0a1e,#1a0612)', color: 'white', fontFamily: 'Heebo, sans-serif' };
  const mainStyle = { flex: 1, overflowY: 'auto', fontFamily: 'Heebo, sans-serif', background: '#fdf8f5' };
  const card = { background: 'white', border: '1px solid #f0f0f0', borderRadius: '16px' };

  return (
    <div dir="rtl" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {toast && <div style={{ position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#2d0a1e', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'Heebo, sans-serif' }}>{toast}</div>}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>💅</span>
          <div>
            <p style={{ fontWeight: 900, color: '#ffb6c1', margin: 0, fontSize: '0.875rem' }}>ליאור שגב</p>
            <p style={{ opacity: 0.4, fontSize: '0.7rem', margin: 0 }}>היופי שלך</p>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '1rem' }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right', border: 'none', cursor: 'pointer', marginBottom: '2px', background: tab === item.id ? 'rgba(255,182,193,0.15)' : 'transparent', color: tab === item.id ? '#ffb6c1' : 'rgba(255,255,255,0.55)', fontFamily: 'Heebo, sans-serif' }}>
              <Icon name={item.icon} className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setTab('booking')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,182,193,0.1)', color: '#ffb6c1', border: 'none', cursor: 'pointer', marginBottom: '6px', fontFamily: 'Heebo, sans-serif' }}>
            <Icon name="link" className="w-3.5 h-3.5" /> דף הזמנות שלי
          </button>
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif' }}>
            <Icon name="logout" className="w-3.5 h-3.5" /> יציאה
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={mainStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', margin: 0 }}>{new Date().getHours() < 12 ? 'בוקר טוב' : 'צהריים טובים'} ליאור ✨</h1>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>הנה מה שקורה היום</p>
                </div>
                <button onClick={() => setTab('booking')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2d0a1e,#8b2252)', color: '#ffb6c1', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif' }}>
                  <Icon name="link" className="w-4 h-4" /> דף הזמנות
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[{ label: 'תורים היום', value: todayAppts.length, emoji: '🗓', color: '#8b2252' }, { label: 'הכנסה היום', value: fmtPrice(revenue), emoji: '💰', color: '#e91e8c' }, { label: 'תורים קרובים', value: upcoming, emoji: '⏰', color: '#d81b60' }].map((s, i) => (
                  <div key={i} style={{ ...card, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b7280' }}>{s.label}</span>
                      <span style={{ fontSize: '1.5rem' }}>{s.emoji}</span>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', margin: 0 }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div style={card}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontWeight: 900, color: '#2d0a1e', margin: 0 }}>לוח תורים היום 🗓</h2>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: '#fdf8f5', color: '#8b2252' }}>{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                {todayAppts.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌸</div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>אין תורים להיום</p>
                  </div>
                ) : todayAppts.map(appt => (
                  <div key={appt.id} style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #fafafa' }}>
                    <div style={{ width: '52px', textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontWeight: 900, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>{fmtTime(appt.appointment_time)}</p>
                    </div>
                    <div style={{ width: '3px', height: '36px', borderRadius: '999px', flexShrink: 0, background: '#fce7f3' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>{appt.customer_name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 0' }}>{appt.service_name}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: appt.status === 'completed' ? '#d1fae5' : '#fce7f3', color: appt.status === 'completed' ? '#059669' : '#be185d' }}>
                      {appt.status === 'completed' ? 'הושלם' : 'מאושר'}
                    </span>
                    <span style={{ fontWeight: 900, color: '#8b2252', fontSize: '0.9rem', flexShrink: 0 }}>{fmtPrice(appt.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {tab === 'calendar' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '1.5rem' }}>יומן 🗓</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem' }}>
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f9fafb' }}>
                    <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="chevronR" className="w-4 h-4" /></button>
                    <span style={{ fontWeight: 900, color: '#2d0a1e' }}>{calMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</span>
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
                            style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 700, border: 'none', cursor: 'pointer', position: 'relative', background: isSel ? 'linear-gradient(135deg,#2d0a1e,#8b2252)' : isToday ? '#fce7f3' : 'transparent', color: isSel ? 'white' : '#2d0a1e' }}>
                            {i + 1}
                            {hasA && <div style={{ position: 'absolute', bottom: '3px', width: '6px', height: '6px', borderRadius: '50%', background: isSel ? 'rgba(255,255,255,0.7)' : '#e91e8c' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div style={card}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f9fafb' }}>
                    <p style={{ fontWeight: 900, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>{selDay.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                  </div>
                  {appointments.filter(a => new Date(a.appointment_time).toDateString() === selDay.toDateString() && a.status !== 'cancelled').map(appt => (
                    <div key={appt.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #fafafa' }}>
                      <p style={{ fontWeight: 700, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>{appt.customer_name}</p>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '2px 0 0' }}>{fmtTime(appt.appointment_time)} · {appt.service_name}</p>
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
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', margin: 0 }}>שירותים 💅</h1>
                <button onClick={() => { setEditSvc(null); setShowModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.625rem 1rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2d0a1e,#8b2252)', color: '#ffb6c1', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif' }}>
                  <Icon name="plus" className="w-4 h-4" /> שירות חדש
                </button>
              </div>
              {[...new Set(services.filter(s => s.is_active).map(s => s.category))].map(cat => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontWeight: 900, color: '#8b2252', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{cat}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                    {services.filter(s => s.is_active && s.category === cat).map(svc => (
                      <div key={svc.id} style={{ ...card, padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <p style={{ fontWeight: 700, color: '#2d0a1e', margin: 0, fontSize: '0.9rem' }}>{svc.name}</p>
                          <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                            <button onClick={() => { setEditSvc(svc); setShowModal(true); }} style={{ padding: '5px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setServices(services.map(s => s.id === svc.id ? { ...s, is_active: false } : s)); showToast('השירות הוסר'); }} style={{ padding: '5px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                              <Icon name="trash" className="w-4 h-4" style={{ color: '#ef4444' }} />
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '999px', background: '#fce7f3', color: '#be185d', fontWeight: 700 }}>{svc.duration} דק׳</span>
                          <span style={{ fontWeight: 900, color: '#8b2252', fontSize: '1rem' }}>{fmtPrice(svc.price)}</span>
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
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '1.5rem' }}>לקוחות 👥</h1>
              <div style={card}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  {['שם', 'טלפון', 'ביקור אחרון', 'תורים'].map(h => <span key={h} style={{ fontSize: '0.75rem', fontWeight: 900, color: '#9ca3af', letterSpacing: '0.05em' }}>{h}</span>)}
                </div>
                {[...new Map(appointments.map(a => [a.customer_phone, a])).values()].map((appt, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '1rem 1.5rem', alignItems: 'center', borderBottom: '1px solid #fafafa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 900, background: '#fce7f3', color: '#be185d', flexShrink: 0 }}>{appt.customer_name[0]}</div>
                      <span style={{ fontWeight: 700, color: '#2d0a1e', fontSize: '0.875rem' }}>{appt.customer_name}</span>
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{appt.customer_phone}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{fmtDate(appt.appointment_time)}</span>
                    <span style={{ fontWeight: 900, color: '#8b2252', fontSize: '0.875rem' }}>{appointments.filter(a => a.customer_phone === appt.customer_phone).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AVAILABILITY */}
          {tab === 'availability' && (
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', marginBottom: '0.25rem' }}>שעות פעילות 🕐</h1>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>הגדרי את הימים והשעות שבהם את עובדת</p>
              <div style={card}>
                {availability.map((day, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < 6 ? '1px solid #f9fafb' : 'none' }}>
                    <div style={{ width: '80px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: day.is_active ? '#2d0a1e' : '#9ca3af' }}>יום {DAY_NAMES[day.day_of_week]}</span>
                    </div>
                    <button onClick={() => setAvailability(availability.map((d, j) => j === i ? { ...d, is_active: !d.is_active } : d))}
                      style={{ width: '40px', height: '20px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: day.is_active ? '#8b2252' : '#d1d5db', position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', transition: 'left 0.2s', left: day.is_active ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </button>
                    {day.is_active ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="time" value={day.start_time} onChange={e => setAvailability(availability.map((d, j) => j === i ? { ...d, start_time: e.target.value } : d))}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }} />
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>עד</span>
                        <input type="time" value={day.end_time} onChange={e => setAvailability(availability.map((d, j) => j === i ? { ...d, end_time: e.target.value } : d))}
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e5e7eb', outline: 'none', fontSize: '0.875rem' }} />
                      </div>
                    ) : <span style={{ color: '#d1d5db', fontWeight: 700, fontSize: '0.875rem' }}>סגור</span>}
                  </div>
                ))}
              </div>
              <button onClick={() => showToast('שעות הפעילות נשמרו ✅')}
                style={{ marginTop: '1rem', padding: '0.875rem 1.5rem', borderRadius: '12px', background: 'linear-gradient(135deg,#2d0a1e,#8b2252)', color: '#ffb6c1', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif' }}>
                שמירת שינויים
              </button>
            </div>
          )}

          {/* BOOKING PREVIEW */}
          {tab === 'booking' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button onClick={() => setTab('overview')} style={{ padding: '8px', borderRadius: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Icon name="chevronR" className="w-5 h-5" />
                </button>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2d0a1e', margin: 0 }}>דף ההזמנות שלך</h1>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '2px 0 0' }}>bookslot.app/book/lior-segev</p>
                </div>
              </div>
              <div style={{ ...card, padding: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fce7f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🔗</div>
                <div>
                  <p style={{ fontWeight: 700, color: '#2d0a1e', margin: 0, fontSize: '0.875rem' }}>קישור לדף הזמנות</p>
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', fontFamily: 'monospace', margin: '2px 0 0' }}>bookslot.app/book/lior-segev</p>
                </div>
                <button onClick={() => showToast('הקישור הועתק ✅')} style={{ marginRight: 'auto', padding: '0.5rem 1rem', borderRadius: '10px', background: '#fce7f3', color: '#be185d', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', fontFamily: 'Heebo, sans-serif' }}>העתקה</button>
              </div>
              <div style={{ border: '2px solid #f0f0f0', borderRadius: '16px', overflow: 'hidden' }}>
                <BookingPage onBack={() => setTab('overview')} />
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
  const [view, setView] = useState('auth');
  if (typeof window === 'undefined') return null;
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Heebo, sans-serif; }`}</style>
      {view === 'auth' && <AuthScreen onLogin={(u) => { setUser(u); setView('dashboard'); }} />}
      {view === 'dashboard' && user && <Dashboard user={user} onLogout={() => { setUser(null); setView('auth'); }} />}
      {view === 'booking' && <BookingPage onBack={() => setView(user ? 'dashboard' : 'auth')} />}
    </>
  );
}
