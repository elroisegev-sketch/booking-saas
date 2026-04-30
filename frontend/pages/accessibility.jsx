import LegalFooter from '../components/LegalFooter';

export default function AccessibilityPage() {
  return (
    <>
      <main id="main-content">
        <div style={{
          direction: 'rtl',
          fontFamily: "'Heebo', 'Arial', sans-serif",
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 24px',
          lineHeight: 1.9,
          color: '#333',
        }}>
          <h1 style={{ color: '#A11738', fontSize: '28px', marginBottom: '8px' }}>
            הצהרת נגישות
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '32px' }}>
            עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}
          </p>

          <Section title="כללי">
            <p>
              אנו מאמינים שכל אדם זכאי לגישה שווה למידע ולשירותים מקוונים.
              אתר זה פועל לעמוד בדרישות תקן IS 5568 הישראלי המבוסס על
              הנחיות הנגישות לתוכן אינטרנט WCAG 2.0 ברמה AA, בהתאם לחוק
              שוויון זכויות לאנשים עם מוגבלות, תשנ״ח-1998 ותקנות הנגישות
              שהותקנו מכוחו.
            </p>
          </Section>

          <Section title="התאמות הנגישות שבוצעו באתר">
            <ul>
              <li>האתר מותאם לשימוש עם קוראי מסך (Screen Readers)</li>
              <li>ניתן לנווט באתר באמצעות מקלדת בלבד</li>
              <li>תמיכה בשינוי גודל טקסט ללא אובדן תוכן</li>
              <li>ניגודיות צבעים מספקת בין טקסט לרקע</li>
              <li>תמונות מלוות בטקסט חלופי (alt text)</li>
              <li>טפסים מסומנים בתוויות (labels) ברורות</li>
              <li>שימוש במבנה כותרות היררכי ותקין</li>
              <li>קישורים ברורים ומובנים</li>
              <li>תפריט נגישות עם כלים להתאמה אישית</li>
              <li>קיצורי מקלדת לפעולות עיקריות</li>
            </ul>
          </Section>

          <Section title="כלי הנגישות באתר">
            <p>
              בלחיצה על כפתור הנגישות (♿) בפינה הימנית התחתונה של המסך,
              או בלחיצה על Alt+A, ניתן לגשת לכלים הבאים:
            </p>
            <ul>
              <li>הגדלת/הקטנת טקסט</li>
              <li>שינוי ניגודיות</li>
              <li>הדגשת קישורים</li>
              <li>מעבר לגווני אפור</li>
              <li>שינוי לגופן קריא</li>
              <li>עצירת אנימציות</li>
              <li>הגדלת סמן העכבר</li>
              <li>הגדלת ריווח שורות</li>
            </ul>
          </Section>

          <Section title="יצירת קשר בנושא נגישות">
            <p>
              אם נתקלתם בבעיית נגישות באתר, נשמח לשמוע מכם ולטפל בכך
              בהקדם האפשרי.
            </p>
            <p>
              <strong>רכזת נגישות:</strong> ליאור שגב<br />
              <strong>טלפון:</strong>{' '}
              <a href="tel:+972535249688" dir="ltr">053-524-9688</a><br />
              <strong>דוא״ל:</strong>{' '}
              <a href="mailto:liordanino58@gmail.com">liordanino58@gmail.com</a>
            </p>
          </Section>

          <Section title="הבהרה">
            <p>
              אנו משקיעים מאמצים רבים בהנגשת האתר, אולם ייתכן שחלקים
              מסוימים טרם הונגשו במלואם. אנו ממשיכים לעבוד על שיפור
              הנגישות ושואפים להגיע לרמה הגבוהה ביותר.
            </p>
          </Section>
        </div>
      </main>
      <LegalFooter />
    </>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: '28px' }}>
      <h2 style={{
        fontSize: '20px',
        color: '#A11738',
        marginBottom: '12px',
        paddingBottom: '6px',
        borderBottom: '2px solid #F7C1C3',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: '15px' }}>
        {children}
      </div>
    </section>
  );
}
