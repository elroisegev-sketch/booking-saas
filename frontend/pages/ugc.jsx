import { useRef, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import LegalFooter from "../components/LegalFooter";
import { site, whatsappLink } from "../lib/site";
import { UGC_VIDEOS, resolveVideo } from "../lib/ugcVideos";

const AccessibilityWidget = dynamic(() => import("../components/AccessibilityWidget"), {
  ssr: false,
});
const UgcMotion = dynamic(() => import("../components/UgcMotion"), { ssr: false });
const LiquidMetalButton = dynamic(
  () => import("../components/ui/liquid-metal-button").then((m) => m.LiquidMetalButton),
  { ssr: false }
);

const BRANDS = [{ name: "ETCASIA", href: "https://www.instagram.com/liors_beauty" }];

const BRIEF_FORMATS = ["סטורי טיים", "ריל", "GRWM", "אנבוקסינג", "Voice Over"];
const BRIEF_VIBES = ["נקי", "ביתי", "אנרגטי", "רגוע"];
const BRIEF_WHEN = ["השבוע", "עד שבועיים", "גמיש"];

function safeBrand(value) {
  if (!value || typeof value !== "string") return "";
  const text = value.trim().slice(0, 40);
  return /^[\u0590-\u05FFa-zA-Z0-9 .'\-&]+$/.test(text) ? text : "";
}

function buildBriefMessage({ brand, format, vibe, when }) {
  const who = brand ? ` (${brand})` : "";
  return `היי ליאור, ראיתי את האתר${who}. מחפשים ${format}, אווירה ${vibe}, לזמן ${when}. נשמח לדבר.`;
}

const REASONS = [
  { title: "נראה אמיתי", text: "מצלמת כמו שאני באמת חיה. בלי הצגות." },
  { title: "המוצר נראה טוב", text: "תאורה ופריים, שהכל ייצא ברור." },
  { title: "מוסרת מוכן", text: "עריכה, כתוביות וסאונד כלולים." },
  { title: "אפשר להתחיל מהר", text: "לא צריך לחכות חודשים לתור." },
  { title: "עומדת בזמנים", text: "מה שקבענו, זה מה שמגיע." },
];

const NICHES = [
  { name: "UGC", items: "סקירות, סטורי טיים, תוכן ממומן" },
  { name: "ביוטי", items: "טיפוח, איפור, GRWM, המלצות" },
  { name: "לייף סטייל", items: "יום בחיי, בתי קפה, מתכונים, השראה" },
  { name: "וולוגים", items: "טיולים, Voice Over, רגעים מהחיים" },
];

const FORMATS = ["UGC", "GRWM", "סקירת מוצרים", "סטורי טיים", "וולוגים", "Voice Over"];

const ico = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

function IconWhatsapp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zm-5.42 7.4h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26C2.16 5.34 6.59.9 12.05.9c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0012.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 005.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="20" height="20" {...ico}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="20" height="20" {...ico}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7.5 12 13l9-5.5" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="20" height="20" {...ico}>
      <path d="M6.4 3.8c.3-.4.9-.6 1.4-.4l2.1.8c.4.15.7.5.75.95l.3 2.2c.05.4-.1.8-.4 1.05L9.2 9.4a11.2 11.2 0 005.4 5.4l1-.95c.25-.3.65-.45 1.05-.4l2.2.3c.45.06.8.35.95.75l.8 2.1c.2.55 0 1.15-.4 1.45-1.2.9-3.15 1.45-6.1.15-4.15-1.85-7.5-5.2-9.35-9.35-1.3-2.95-.75-4.9.15-6.1z" />
    </svg>
  );
}

function PhoneCard({ item }) {
  const video = resolveVideo(item);
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const el = playerRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

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
            <button type="button" className="ugc-video-btn" onClick={togglePlay} aria-label={playing ? `השהיית ${item.title}` : `הפעלת ${item.title}`}>
              <video
                ref={playerRef}
                src={video.src}
                playsInline
                preload="metadata"
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
              />
              {!playing && (
                <span className="ugc-play-overlay">
                  <span className="ugc-play" aria-hidden="true">▶</span>
                  <span>הפעלה</span>
                </span>
              )}
            </button>
          )}
          {video.kind === "link" && (
            <a href={video.src} target="_blank" rel="noopener noreferrer" className="ugc-phone-empty">
              <span className="ugc-play" aria-hidden="true">▶</span>
              <span>לצפייה</span>
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
    </article>
  );
}

export default function UgcPage() {
  const router = useRouter();
  const brandName = safeBrand(
    Array.isArray(router.query.brand) ? router.query.brand[0] : router.query.brand
  );
  const [brief, setBrief] = useState({ format: "", vibe: "", when: "" });
  const canonical = `${site.url}/ugc`;

  const briefReady = brief.format && brief.vibe && brief.when;
  const briefHref = briefReady
    ? whatsappLink(buildBriefMessage({ brand: brandName, ...brief }))
    : "";

  return (
    <>
      <Head>
        <title>ליאור שגב | יוצרת תוכן UGC · ביוטי · לייף סטייל</title>
        <meta
          name="description"
          content="ליאור שגב, יוצרת תוכן בביוטי לייף סטייל ווולוגים. סרטונים לשת״פ עם מותגים."
        />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="he-IL" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:title" content="ליאור שגב | יוצרת תוכן UGC" />
        <meta property="og:description" content="ביוטי, לייף סטייל ווולוגים. סרטונים לשת״פ." />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${site.url}/lior-profile.png`} />
      </Head>

      <div className="ugc-root" dir="rtl">
        <header className="ugc-hero">
          <p className="ugc-bsd ugc-hero-anim">בס״ד</p>
          <img src="/logo-pink.png" alt="ליאור שגב, היופי שלך" className="ugc-logo ugc-hero-anim" />
          <div className="ugc-photo-wrap ugc-hero-anim">
            <img className="ugc-photo-img" src="/lior-profile.png" alt="ליאור שגב, יוצרת תוכן ביוטי ולייף סטייל" />
          </div>
          <p className="ugc-kicker ugc-hero-anim">יוצרת תוכן</p>
          <h1 className="ugc-hero-anim">ליאור שגב</h1>
          <p className="ugc-sub ugc-hero-anim">וולוגים · ביוטי · לייף סטייל</p>
          <p className="ugc-line ugc-hero-anim">
            {brandName ? `חשבתי איך זה ייראה אצל ${brandName}` : "מצלמת ביוטי ולייף סטייל"}
          </p>
          <a href="#contact" className="ugc-btn ugc-hero-anim">דברו איתי</a>
          <a href="#portfolio" className="ugc-works ugc-hero-anim">
            <span className="ugc-ghost">לעבודות</span>
            <span className="ugc-down" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </a>
        </header>

        <main id="main-content">
          <section className="ugc-section ugc-reveal">
            <p className="ugc-label">קצת עליי</p>
            <h2>היי, אני ליאור.</h2>
            <p className="ugc-lead">
              אני מצלמת ביוטי ולייף סטייל. התוכן יוצא טבעי, כמו שאני באמת חיה.
            </p>
            <div className="ugc-meta">
              <span>בת 21</span>
              <span>מגבעת שמואל</span>
              <span>@liors_beauty</span>
            </div>
            <div className="ugc-brands" aria-label="שת״פים">
              <p className="ugc-brands-label">שת״פ אחרון</p>
              {BRANDS.map((b) => (
                <a key={b.name} className="ugc-brand" href={b.href} target="_blank" rel="noopener noreferrer">
                  {b.name}
                </a>
              ))}
            </div>
          </section>

          <section className="ugc-section ugc-reveal">
            <p className="ugc-label">מה אני עושה</p>
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

          <section className="ugc-section ugc-reveal">
            <p className="ugc-label">עבודה איתי</p>
            <h2>איך זה אצלי</h2>
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
            <div className="ugc-reveal">
            <p className="ugc-label">תיק עבודות</p>
            <h2>דוגמאות לסרטונים</h2>
            <p className="ugc-note">
              לחצי על הטלפון להפעלה.
            </p>
            </div>
            <div className="ugc-phones">
              {UGC_VIDEOS.map((item) => (
                <PhoneCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          <section className="ugc-section ugc-cta ugc-reveal" id="contact">
            <div className="ugc-cta-card" id="brief">
              <span className="ugc-sparkle" aria-hidden="true">✦</span>
              <p className="ugc-label">יצירת קשר</p>
              <h2>רוצים לצלם יחד?</h2>
              <p className="ugc-lead">
                {brandName
                  ? `סמנו מה מעניין את ${brandName}, ואשלח את זה לוואטסאפ.`
                  : "סמנו מה מעניין אתכם, ואשלח את זה לוואטסאפ."}
              </p>
              <div className="ugc-brief">
                <p className="ugc-brief-q">איזה פורמט?</p>
                <div className="ugc-filters">
                  {BRIEF_FORMATS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`ugc-chip${brief.format === label ? " is-on" : ""}`}
                      onClick={() => setBrief((prev) => ({ ...prev, format: label }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="ugc-brief-q">איזו אווירה?</p>
                <div className="ugc-filters">
                  {BRIEF_VIBES.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`ugc-chip${brief.vibe === label ? " is-on" : ""}`}
                      onClick={() => setBrief((prev) => ({ ...prev, vibe: label }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="ugc-brief-q">מתי צריך?</p>
                <div className="ugc-filters">
                  {BRIEF_WHEN.map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`ugc-chip${brief.when === label ? " is-on" : ""}`}
                      onClick={() => setBrief((prev) => ({ ...prev, when: label }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={`ugc-metal-wrap${briefReady ? "" : " is-wait"}`}>
                <LiquidMetalButton
                  label={briefReady ? "שליחה בוואטסאפ" : "בחרו פורמט, אווירה וזמן"}
                  onClick={() => {
                    if (!briefHref) return;
                    window.open(briefHref, "_blank", "noopener,noreferrer");
                  }}
                />
              </div>
              <div className="ugc-contacts">
                <a href="https://www.instagram.com/liors_beauty" target="_blank" rel="noopener noreferrer" className="ugc-contact">
                  <span className="ugc-ico" aria-hidden="true"><IconInstagram /></span>
                  <span>
                    <small>אינסטגרם</small>
                    @liors_beauty
                  </span>
                </a>
                <a href="mailto:liordanino58@gmail.com" className="ugc-contact">
                  <span className="ugc-ico" aria-hidden="true"><IconMail /></span>
                  <span>
                    <small>מייל</small>
                    liordanino58@gmail.com
                  </span>
                </a>
                <a href={`tel:+${site.whatsapp}`} className="ugc-contact">
                  <span className="ugc-ico" aria-hidden="true"><IconPhone /></span>
                  <span>
                    <small>טלפון</small>
                    <b dir="ltr">{site.phoneDisplay}</b>
                  </span>
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>

      <LegalFooter />
      <UgcMotion />
      <AccessibilityWidget />

      <style jsx global>{`
        .lenis.lenis-smooth { scroll-behavior: auto !important; }

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
          position: relative;
        }
        .ugc-root * { box-sizing: border-box; }
        .ugc-root::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 40;
          opacity: 0.045;
          background:
            radial-gradient(circle at 20% 20%, rgba(45,10,30,0.08) 0.6px, transparent 0.8px),
            radial-gradient(circle at 80% 40%, rgba(45,10,30,0.06) 0.5px, transparent 0.7px);
          background-size: 3px 3px, 4px 4px;
        }

        .ugc-hero, .ugc-section {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .ugc-hero {
          text-align: center;
          padding: 28px 20px 48px;
          transform-origin: 50% 0;
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
        .ugc-photo-img {
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
        .ugc-works {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin: 14px auto 0;
          width: min(280px, 100%);
          text-decoration: none;
          color: var(--brand);
        }
        .ugc-works .ugc-ghost {
          display: flex;
          width: 100%;
          margin: 0;
        }
        .ugc-down {
          display: grid;
          place-items: center;
          color: var(--brand);
          animation: ugc-bounce 1.35s ease-in-out infinite;
        }
        @keyframes ugc-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.45; }
          50% { transform: translateY(8px); opacity: 1; }
        }
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
        .ugc-brands {
          margin: 22px 0 0;
        }
        .ugc-brands-label {
          margin: 0 0 8px;
          color: var(--soft);
          font-size: 0.72rem;
          letter-spacing: 0.16em;
        }
        .ugc-brand {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          text-decoration: none;
          color: var(--brand);
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(255,255,255,0.92);
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .ugc-filters {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          margin: 0 0 8px;
        }
        .ugc-chip {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.72);
          color: var(--brand);
          font: inherit;
          font-size: 0.82rem;
          cursor: pointer;
        }
        .ugc-chip.is-on {
          background: linear-gradient(135deg, #a11738, #ec6a83);
          border-color: transparent;
          color: #fff;
        }
        .ugc-brief {
          margin: 18px 0 8px;
          text-align: center;
        }
        .ugc-brief-q {
          margin: 14px 0 8px;
          color: var(--brand);
          font-size: 0.82rem;
          font-weight: 700;
        }
        .ugc-metal-wrap.is-wait {
          opacity: 0.55;
        }
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
          object-fit: cover;
          background: #1a0612;
        }
        .ugc-video-btn {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: #1a0612;
          cursor: pointer;
        }
        .ugc-play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          background: rgba(45, 10, 30, 0.28);
          font-size: 0.78rem;
          font-weight: 700;
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
        .ugc-cta-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,0.92);
          border-radius: 32px;
          padding: 36px 22px 28px;
          box-shadow: 0 18px 48px rgba(161, 23, 56, 0.12), inset 0 1px 0 rgba(255,255,255,1);
        }
        .ugc-sparkle {
          display: block;
          color: #c4a35a;
          font-size: 1.05rem;
          margin-bottom: 8px;
          opacity: 0.8;
        }
        .ugc-cta .ugc-btn {
          width: 100%;
          max-width: 320px;
          gap: 10px;
          margin: 8px auto 0;
        }
        .ugc-metal-wrap {
          display: flex;
          justify-content: center;
          margin: 12px 0 4px;
        }
        .ugc-contacts {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 22px 0 16px;
        }
        .ugc-contact {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: right;
          text-decoration: none;
          color: var(--brand);
          background: rgba(255,245,247,0.7);
          border: 1px solid rgba(247,193,195,0.45);
          border-radius: 18px;
          padding: 12px 14px;
        }
        .ugc-contact small {
          display: block;
          color: var(--soft);
          font-size: 0.72rem;
          margin-bottom: 2px;
        }
        .ugc-contact span:last-child {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .ugc-contact b { font-weight: 700; }
        .ugc-ico {
          flex: none;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--brand);
          background: linear-gradient(150deg, #fde3ea, #f8eefc);
          box-shadow: 0 6px 16px rgba(161, 23, 56, 0.12);
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
