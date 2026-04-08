import Head from 'next/head';

export default function Maintenance() {
  return (
    <>
      <Head>
        <title>ליאור שגב יופי — סגור כרגע</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff5f7 0%, #fce8f3 40%, #f3eeff 80%, #fff5f7 100%)',
        fontFamily: "'Varela Round', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          {/* לוגו */}
          <img
            src="/logo-pink.png"
            alt="ליאור שגב"
            style={{ height: '64px', objectFit: 'contain', marginBottom: '2rem', maxWidth: '200px', display: 'block', margin: '0 auto 2rem' }}
          />

          {/* כרטיס */}
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.85)',
            borderRadius: '32px',
            padding: '2.5rem 2rem',
            boxShadow: '0 16px 48px rgba(161,23,56,0.1), inset 0 1px 0 rgba(255,255,255,1)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>

            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              color: '#A11738',
              marginBottom: '0.75rem',
            }}>
              האתר סגור כרגע
            </h1>

            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              lineHeight: 1.7,
              marginBottom: '1.75rem',
            }}>
              ההזמנות פתוחות בין השעות
              <br />
              <span style={{ fontWeight: 700, color: '#A11738' }}>10:00 עד 21:00</span>
              <br />
              מחכים לראותך מחר בבוקר 🌸
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(161,23,56,0.06), rgba(236,106,131,0.06))',
              border: '1.5px solid rgba(247,193,195,0.5)',
              borderRadius: '16px',
              padding: '1rem',
              fontSize: '0.875rem',
              color: '#A11738',
              fontWeight: 600,
            }}>
              ההזמנות נפתחות מחדש בשעה 10:00 ☀️
            </div>
          </div>

          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: 'rgba(161,23,56,0.4)',
            letterSpacing: '0.1em',
          }}>
            LIOR SEGEV BEAUTY
          </p>
        </div>
      </div>
    </>
  );
}
