/**
 * LegalFooter.jsx - פוטר עם כל הקישורים החוקיים הנדרשים
 * 
 * שימוש: הוסיפו <LegalFooter /> בתחתית ה-layout הראשי
 * 
 * ודאו שיש לכם את ה-routes:
 * - /privacy → PrivacyPolicy.jsx
 * - /terms → TermsOfService.jsx
 * - /accessibility → (כבר קיים ב-AccessibilityWidget כ-modal)
 */

import { useState } from "react";

export default function LegalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      direction: 'rtl',
      fontFamily: "'Heebo', 'Arial', sans-serif",
      background: '#1a1a1a',
      color: '#ccc',
      padding: '40px 24px 24px',
      marginTop: '60px',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '32px',
      }}>
        {/* עמודה 1 - פרטי העסק */}
        <div>
          <h3 style={colTitle}>ליאור ביוטי</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.7 }}>
            ליאור שגב<br />
            גבעת שמואל<br />
            <a href="tel:+972535249688" style={linkStyle} dir="ltr">053-524-9688</a><br />
            <a href="mailto:liordanino58@gmail.com" style={linkStyle}>liordanino58@gmail.com</a>
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <SocialIcon href="https://wa.me/972535249688" label="WhatsApp">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </SocialIcon>
            <SocialIcon href="https://instagram.com/liors_beauty" label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </SocialIcon>
          </div>
        </div>

        {/* עמודה 2 - קישורים חוקיים */}
        <div>
          <h3 style={colTitle}>מידע חוקי</h3>
          <nav>
            <FooterLink href="/terms">תקנון ותנאי שימוש</FooterLink>
            <FooterLink href="/privacy">מדיניות פרטיות</FooterLink>
            <FooterLink href="/accessibility">הצהרת נגישות</FooterLink>
          </nav>
        </div>

        {/* עמודה 3 - שעות פעילות */}
        <div>
          <h3 style={colTitle}>שעות פעילות</h3>
          <p style={{ fontSize: '14px', lineHeight: 2 }}>
            ימים א׳–ה׳: 10:00–18:00<br />
            שישי–שבת: סגור
          </p>
        </div>
      </div>

      {/* שורה תחתונה */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        borderTop: '1px solid #333',
        marginTop: '32px',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '13px',
        color: '#888',
      }}>
        <span>© {currentYear} ליאור ביוטי. כל הזכויות שמורות.</span>
        <span>
          רכזת נגישות: ליאור שגב |{' '}
          <a href="tel:+972535249688" style={{ color: '#aaa', textDecoration: 'none' }} dir="ltr">
            053-524-9688
          </a>
        </span>
      </div>
    </footer>
  );
}

const colTitle = {
  color: '#EC6A83',
  fontSize: '16px',
  fontWeight: 700,
  marginBottom: '12px',
};

const linkStyle = {
  color: '#ccc',
  textDecoration: 'none',
};

function FooterLink({ href, children }) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        color: '#ccc',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '6px 0',
        transition: 'color 0.15s',
      }}
      onMouseEnter={(e) => e.target.style.color = '#EC6A83'}
      onMouseLeave={(e) => e.target.style.color = '#ccc'}
    >
      {children}
    </a>
  );
}

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#333',
        color: '#ccc',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#A11738';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#333';
        e.currentTarget.style.color = '#ccc';
      }}
    >
      {children}
    </a>
  );
}
