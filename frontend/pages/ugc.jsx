import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import LegalFooter from "../components/LegalFooter";
import { site, whatsappLink } from "../lib/site";
import { UGC_VIDEOS, resolveVideo } from "../lib/ugcVideos";

const AccessibilityWidget = dynamic(() => import("../components/AccessibilityWidget"), {
  ssr: false,
});

const COLLAB_WA = whatsappLink(
  "היי ליאור, ראיתי את תיק העבודות ואשמח לשתף פעולה על תוכן UGC"
);

const REASONS = [
  { title: "תוכן אותנטי", text: "נראה כמו חיים אמיתיים, לא כמו פרסומת." },
  { title: "צילום איכותי", text: "תאורה, קומפוזיציה ופריים שמכבדים את המוצר." },
  { title: "עריכה מקצועית", text: "קצב, טקסט וסאונד שמותאמים לרשת." },
  { title: "זמינות גבוהה", text: "אפשר לסגור שת״פ בלי לחכות חודשים." },
  { title: "עמידה בזמנים", text: "מה שסוגרים — זה מה שנמסר." },
];

const NICHES = [
  { name: "UGC", items: "סקירות, סטורי טיים, תוכן ממומן" },
  { name: "ביוטי", items: "טיפוח, איפור, GRWM, המלצות" },
  { name: "לייף סטייל", items: "יום בחיי, בתי קפה, מתכונים, השראה" },
  { name: "וולוגים", items: "טיולים, Voice Over, רגעים מהחיים" },
];

const FORMATS = ["UGC", "GRWM", "סקירת מוצרים", "סטורי טיים", "וולוגים", "Voice Over"];

function PhoneCard({ item }) {
  const video = resolveVideo(item);

  return (
    <article className="ugc-phone-card">
      <div className="ugc-phone">
        <div className="ugc-phone-notch" aria-hidden="true" />
        <div className="ugc-phone-screen">
          {video.kind === "embed" && (
            <iframe
              src={video.src}
              title={item.title}
              allow="encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}
          {video.kind === "file" && (
            <video src={video.src} controls playsInline preload="metadata" />
          )}
          {video.kind === "link" && (
            <a href={video.src} target="_blank" rel="noopener noreferrer" className="ugc-phone-empty">
              <span className="ugc-play" aria-hidden="true">▶</span>
              <span>לצפייה בפלטפורמה</span>
            </a>
          )}
          {video.kind === "empty" && (
            <div className="ugc-phone-empty">
              <span className="ugc-play" aria-hidden="true">▶</span>
              <span>הסרטון יעלה לכאן</span>
            </div>
          )}
        </div>
      </div>
      <h3>{item.title}</h3>
      <p>{item.category}</p>
    </article>
  );
}

export default function UgcPage() {
  const canonical = `${site.url}/ugc`;
  const readyCount = UGC_VIDEOS.filter((v) => v.url).length;

  return (
    <>
      <Head>
        <title>ליאור שגב | יוצרת תוכן UGC · ביוטי · לייף סטייל</title>
        <meta
          name="description"
          content="ליאור שגב — יוצרת תוכן אותנטי בביוטי, לייף סטייל ווולוגים. תיק עבודות UGC לשיתופי פעולה עם מותגים."
        />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="he-IL" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:title" content="ליאור שגב | יוצרת תוכן UGC" />
        <meta property="og:description" content="תוכן אותנטי שמייצר אמון. ביוטי, לייף סטייל ווולוגים." />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${site.url}/lior-profile.png`} />
      </Head>

      <div className="ugc-root" dir="rtl">
        <header className="ugc-hero">
          <p className="ugc-bsd">בס״ד</p>
          <img src="/logo-pink.png" alt="ליאור שגב, היופי שלך" className="ugc-logo" />
          <div className="ugc-photo-wrap">
            <img src="/lior-profile.png" alt="ליאור שגב, יוצרת תוכן ביוטי ולייף סטייל" />
          </div>
          <p className="ugc-kicker">יוצרת תוכן</p>
          <h1>ליאור שגב</h1>
          <p className="ugc-sub">וולוגים · ביוטי · לייף סטייל</p>
          <p className="ugc-line">תוכן אותנטי שמייצר אמון</p>
          <div className="ugc-pills" aria-label="תחומים">
            <span>ביוטי</span>
            <span>UGC</span>
            <span>לייף סטייל</span>
          </div>
          <a href="#contact" className="ugc-btn">בואו ניצור תוכן יחד</a>
          <a href="#portfolio" className="ugc-ghost">לתיק העבודות</a>
        </header>

        <main id="main-content">
          <section className="ugc-section">
            <p className="ugc-label">קצת עליי</p>
            <h2>היי, אני ליאור.</h2>
            <p className="ugc-lead">
              יוצרת תוכן בלייף סטייל ובביוטי. אני מצלמת תוכן אותנטי ואסתטי,
              כזה שמאפשר למותגים להתחבר לקהל בצורה טבעית — בלי להרגיש מכירה.
            </p>
            <div className="ugc-meta">
              <span>בת 21</span>
              <span>מגבעת שמואל</span>
              <span>@liors_beauty</span>
            </div>
          </section>

          <section className="ugc-section">
            <p className="ugc-label">תחומי התוכן שלי</p>
            <h2>מה אני מצלמת</h2>
            <div className="ugc-formats">
              {FORMATS.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <div className="ugc-niches">
              {NICHES.map((n) => (
                <article key={n.name} className="ugc-card">
                  <h3>{n.name}</h3>
                  <p>{n.items}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ugc-section">
            <p className="ugc-label">סיבות לעבוד איתי</p>
            <h2>למה מותגים סוגרים איתי</h2>
            <div className="ugc-reasons">
              {REASONS.map((r) => (
                <article key={r.title} className="ugc-card">
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ugc-section" id="portfolio">
            <p className="ugc-label">תיק עבודות</p>
            <h2>סרטונים לדוגמה</h2>
            <p className="ugc-note">
              {readyCount === 0
                ? "הסרטונים עולים לכאן ממש בקרוב. בינתיים אפשר לראות את הסגנון באינסטגרם."
                : "לחצי על הטלפון לצפייה. רוב הקישורים לטיקטוק — כדאי להעיף מבט גם באינסטגרם."}
            </p>
            <div className="ugc-phones">
              {UGC_VIDEOS.map((item) => (
                <PhoneCard key={item.id} item={item} />
              ))}
            </div>
            <a
              href="https://www.instagram.com/liors_beauty"
              target="_blank"
              rel="noopener noreferrer"
              className="ugc-ghost"
            >
              לאינסטגרם @liors_beauty
            </a>
          </section>

          <section className="ugc-section ugc-cta" id="contact">
            <p className="ugc-label">יצירת קשר</p>
            <h2>בואו ניצור תוכן יחד</h2>
            <p className="ugc-lead">מחכה לשמוע מכם.</p>
            <a href={COLLAB_WA} target="_blank" rel="noopener noreferrer" className="ugc-btn">
              וואטסאפ לשת״פ
            </a>
            <div className="ugc-contacts">
              <a href="https://www.instagram.com/liors_beauty" target="_blank" rel="noopener noreferrer">
                אינסטגרם · @liors_beauty
              </a>
              <a href="mailto:liordanino58@gmail.com">
                liordanino58@gmail.com
              </a>
              <a href={`tel:+${site.whatsapp}`} dir="ltr">
                {site.phoneDisplay}
              </a>
            </div>
            <Link href="/" className="ugc-home">
              לאתר קביעת התורים
            </Link>
          </section>
        </main>
      </div>

      <LegalFooter />
      <AccessibilityWidget />

      <style jsx global>{`
        .ugc-root {
          --brand: #a11738;
          --brand-2: #ec6a83;
          --brand-3: #f7c1c3;
          --ink: #2d0a1e;
          --soft: #8a6b74;
          font-family: "Varela Round", system-ui, sans-serif;
          color: var(--ink);
          background: linear-gradient(160deg, #fdece5 0%, #f7c1c3 42%, #ec6a83 100%);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .ugc-root * { box-sizing: border-box; }
        .ugc-hero, .ugc-section {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .ugc-hero {
          text-align: center;
          padding: 28px 20px 48px;
        }
        .ugc-bsd {
          margin: 0 0 10px;
          color: rgba(45, 10, 30, 0.45);
          font-size: 0.78rem;
        }
        .ugc-logo {
          height: 46px;
          object-fit: contain;
          margin-bottom: 22px;
        }
        .ugc-photo-wrap {
          width: 148px;
          height: 148px;
          margin: 0 auto 18px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(161, 23, 56, 0.22);
          box-shadow: 0 14px 40px rgba(161, 23, 56, 0.24);
        }
        .ugc-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 18%;
        }
        .ugc-kicker {
          margin: 0 0 6px;
          color: var(--brand);
          letter-spacing: 0.22em;
          font-size: 0.72rem;
          opacity: 0.75;
        }
        .ugc-hero h1, .ugc-section h2 {
          margin: 0;
          color: var(--brand);
          line-height: 1.15;
        }
        .ugc-hero h1 {
          font-size: clamp(2.4rem, 10vw, 4.2rem);
          font-weight: 700;
        }
        .ugc-sub {
          margin: 8px 0 0;
          color: var(--brand);
          font-size: 1.05rem;
        }
        .ugc-line {
          margin: 10px 0 0;
          color: #3d0c16;
          opacity: 0.82;
        }
        .ugc-pills, .ugc-formats, .ugc-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }
        .ugc-pills { margin: 22px 0 26px; }
        .ugc-pills span, .ugc-formats span, .ugc-meta span {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(255,255,255,0.9);
          color: var(--brand);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 0.82rem;
          box-shadow: 0 4px 14px rgba(161, 23, 56, 0.08);
        }
        .ugc-btn, .ugc-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 26px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 700;
        }
        .ugc-btn {
          background: linear-gradient(135deg, #a11738, #ec6a83);
          color: #fff;
          box-shadow: 0 8px 28px rgba(161, 23, 56, 0.32);
        }
        .ugc-ghost {
          margin-top: 12px;
          color: var(--brand);
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.8);
        }
        .ugc-hero .ugc-ghost { display: block; max-width: 280px; margin: 12px auto 0; }
        .ugc-section {
          padding: 8px 20px 42px;
          text-align: center;
        }
        .ugc-label {
          margin: 0 0 8px;
          color: var(--brand);
          letter-spacing: 0.18em;
          font-size: 0.72rem;
          opacity: 0.7;
        }
        .ugc-section h2 {
          font-size: clamp(1.6rem, 6vw, 2.1rem);
          margin-bottom: 12px;
        }
        .ugc-lead, .ugc-note {
          margin: 0 auto;
          max-width: 460px;
          color: #3d0c16;
          line-height: 1.75;
          opacity: 0.86;
        }
        .ugc-note { font-size: 0.92rem; margin-bottom: 22px; }
        .ugc-meta { margin: 20px 0 0; }
        .ugc-formats { margin: 8px 0 18px; }
        .ugc-niches, .ugc-reasons {
          display: grid;
          gap: 12px;
          margin-top: 18px;
          text-align: right;
        }
        .ugc-card {
          background: rgba(255,255,255,0.68);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.88);
          border-radius: 22px;
          padding: 18px 18px 16px;
          box-shadow: 0 8px 28px rgba(161, 23, 56, 0.08);
        }
        .ugc-card h3 {
          margin: 0 0 4px;
          color: var(--brand);
          font-size: 1.05rem;
        }
        .ugc-card p {
          margin: 0;
          color: var(--soft);
          line-height: 1.6;
          font-size: 0.92rem;
        }
        .ugc-phones {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 12px;
          margin: 8px 0 20px;
        }
        .ugc-phone-card h3 {
          margin: 10px 0 2px;
          color: var(--brand);
          font-size: 0.92rem;
        }
        .ugc-phone-card p {
          margin: 0;
          color: var(--soft);
          font-size: 0.75rem;
        }
        .ugc-phone {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 17;
          padding: 7px;
          border-radius: 28px;
          background: linear-gradient(180deg, #3d0c16, #2d0a1e);
          box-shadow: 0 16px 36px rgba(45, 10, 30, 0.28);
        }
        .ugc-phone-notch {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 38%;
          height: 10px;
          border-radius: 999px;
          background: #1a0612;
          z-index: 2;
        }
        .ugc-phone-screen {
          height: 100%;
          border-radius: 22px;
          overflow: hidden;
          background: linear-gradient(160deg, #fff5f7, #f7c1c3);
        }
        .ugc-phone-screen iframe,
        .ugc-phone-screen video {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
          background: #1a0612;
        }
        .ugc-phone-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--brand);
          text-decoration: none;
          font-size: 0.78rem;
          padding: 16px;
        }
        .ugc-play {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #a11738, #ec6a83);
          color: #fff;
          font-size: 0.85rem;
          box-shadow: 0 8px 20px rgba(161, 23, 56, 0.3);
        }
        .ugc-cta {
          padding-bottom: 72px;
        }
        .ugc-contacts {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 22px 0 18px;
        }
        .ugc-contacts a {
          color: var(--brand);
          text-decoration: none;
          font-weight: 700;
        }
        .ugc-home {
          color: var(--soft);
          font-size: 0.88rem;
        }
        @media (min-width: 700px) {
          .ugc-niches, .ugc-reasons {
            grid-template-columns: 1fr 1fr;
          }
          .ugc-phones {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ugc-root * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
