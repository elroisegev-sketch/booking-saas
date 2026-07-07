import dynamic from "next/dynamic";
import LegalFooter from "../LegalFooter";

// וידג'ט הנגישות של האתר נטען בצד הלקוח בלבד (הוא לא SSR-safe — נשען על
// localStorage/matchMedia), כדי למנוע אי-התאמת hydration בעמודי הבלוג.
const AccessibilityWidget = dynamic(() => import("../AccessibilityWidget"), {
  ssr: false,
});

// מעטפת עיצוב לכל עמודי הבלוג: פונט Varela Round (כמו האתר, נטען ב-_document),
// רקע הגרדיאנט של המערכת, וכל שפת העיצוב (כרטיסים, כפתורים, טיפוגרפיה, אנימציות)
// במקום אחד. כל הסלקטורים ממודרים תחת .blog-root כדי לא לדלוף לשאר האתר.
// מוסיף גם את הפוטר החוקי הקיים ואת וידג'ט הנגישות של האתר.
export default function BlogShell({ children }) {
  return (
    <>
      {/* אם אין JS — מבטלים את מצב ההסתרה של אנימציית הגלילה כדי שהתוכן ייראה */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>

      <div dir="rtl" className="blog-root">
        {children}
      </div>

      {/* פוטר משפטי + יצירת קשר (רכיב קיים באתר) */}
      <LegalFooter />
      {/* וידג'ט הנגישות של האתר — כדי שיעבוד גם בעמודי הבלוג */}
      <AccessibilityWidget />

      <style jsx global>{`
        .blog-root {
          --brand: #a11738;
          --brand-2: #ec6a83;
          --brand-3: #f7c1c3;
          --brand-4: #fdece5;
          --ink: #3d2530;
          --ink-soft: #8a6b74;
          --card-radius: 24px;
          --card-shadow: 0 8px 32px rgba(161, 23, 56, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          --card-border: 1px solid rgba(161, 23, 56, 0.07);
          font-family: "Varela Round", system-ui, -apple-system, sans-serif;
          color: var(--ink);
          background: linear-gradient(
            135deg,
            #fff5f7 0%,
            #fce8f3 40%,
            #f3eeff 80%,
            #fff5f7 100%
          );
          background-attachment: fixed;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        .blog-root * {
          box-sizing: border-box;
        }

        /* ---------- טיפוגרפיה ---------- */
        .blog-wrap {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .blog-prose {
          font-size: 1.075rem;
          line-height: 1.85;
          color: var(--ink);
        }
        .blog-prose > p {
          margin: 0 0 1.15em;
        }
        .blog-prose h2 {
          font-size: clamp(1.35rem, 4.5vw, 1.7rem);
          color: var(--brand);
          letter-spacing: -0.01em;
          margin: 2.2em 0 0.7em;
          line-height: 1.3;
        }
        .blog-prose a {
          color: var(--brand);
          text-decoration: none;
          border-bottom: 1.5px solid var(--brand-3);
          transition: border-color 0.18s ease, color 0.18s ease;
        }
        .blog-prose a:hover {
          color: var(--brand-2);
          border-color: var(--brand-2);
        }

        h1.blog-title {
          font-size: clamp(2rem, 7vw, 2.7rem);
          line-height: 1.18;
          letter-spacing: -0.02em;
          color: var(--brand);
          margin: 0 0 0.5rem;
        }
        .blog-byline {
          color: var(--ink-soft);
          font-size: 0.92rem;
          margin: 0 0 2.5rem;
        }
        .blog-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #fff;
          color: var(--brand);
          font-size: 0.82rem;
          padding: 7px 15px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(161, 23, 56, 0.1);
        }

        /* ---------- כרטיס בסיס ---------- */
        .blog-card {
          background: #fff;
          border-radius: var(--card-radius);
          box-shadow: var(--card-shadow);
          border: var(--card-border);
        }

        /* ---------- כפתור ראשי (כמו כפתור ההזמנה) ---------- */
        .blog-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-family: inherit;
          font-size: 1.05rem;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #a11738, #ec6a83);
          border: none;
          border-radius: 999px;
          padding: 15px 30px;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(161, 23, 56, 0.28);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .blog-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(161, 23, 56, 0.34);
          filter: brightness(1.03);
        }
        .blog-btn:active {
          transform: translateY(0);
        }
        .blog-btn svg {
          width: 20px;
          height: 20px;
        }
        .blog-btn--block {
          width: 100%;
        }

        /* ---------- כרטיסי מחירון ---------- */
        .price-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .price-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          border-radius: 20px;
          border: var(--card-border);
          box-shadow: var(--card-shadow);
          padding: 16px 18px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .price-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(161, 23, 56, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .price-ico {
          flex: none;
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: var(--brand);
          background: linear-gradient(150deg, #fde3ea, #f8eefc);
          transition: transform 0.25s ease;
        }
        .price-card:hover .price-ico {
          transform: scale(1.08) rotate(-4deg);
        }
        .price-main {
          flex: 1;
          min-width: 0;
        }
        .price-name {
          font-size: 1.05rem;
          color: var(--ink);
        }
        .price-note {
          font-size: 0.82rem;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .price-side {
          text-align: center;
          flex: none;
        }
        .price-amount {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--brand);
          white-space: nowrap;
        }
        .price-dur {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--ink-soft);
          margin-top: 3px;
        }

        /* ---------- FAQ אקורדיון ---------- */
        .faq-item {
          background: #fff;
          border-radius: 18px;
          border: var(--card-border);
          box-shadow: var(--card-shadow);
          overflow: hidden;
        }
        .faq-item + .faq-item {
          margin-top: 12px;
        }
        .faq-q {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 1.02rem;
          font-weight: 700;
          color: var(--brand);
          text-align: start;
          padding: 18px 20px;
        }
        .faq-q svg {
          flex: none;
          color: var(--brand-2);
          transition: transform 0.25s ease;
        }
        .faq-item[data-open="true"] .faq-q svg {
          transform: rotate(180deg);
        }
        .faq-panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s ease;
        }
        .faq-item[data-open="true"] .faq-panel {
          grid-template-rows: 1fr;
        }
        .faq-panel-inner {
          overflow: hidden;
        }
        .faq-a {
          padding: 0 20px 18px;
          color: var(--ink);
          line-height: 1.75;
        }

        /* ---------- CTA ---------- */
        .cta-card {
          text-align: center;
          padding: 34px 24px;
        }
        .cta-card h2 {
          font-size: 1.5rem;
          color: var(--brand);
          margin: 0 0 0.4rem;
        }
        .cta-card p {
          color: var(--ink-soft);
          margin: 0 0 1.4rem;
        }

        /* ---------- כרטיס פוסט ברשימה ---------- */
        .post-card {
          display: block;
          text-decoration: none;
          color: inherit;
          padding: 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .post-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(161, 23, 56, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }
        .post-card .date {
          font-size: 0.82rem;
          color: var(--ink-soft);
          margin: 0 0 6px;
        }
        .post-card h2 {
          font-size: 1.25rem;
          color: var(--brand);
          margin: 0 0 8px;
        }
        .post-card p {
          color: var(--ink-soft);
          margin: 0;
          line-height: 1.6;
        }

        /* ---------- קישור חזרה ---------- */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--brand);
          text-decoration: none;
          font-size: 0.92rem;
          transition: gap 0.18s ease;
        }
        .back-link:hover {
          gap: 10px;
        }

        /* ---------- וואטסאפ צף ---------- */
        .wa-fab {
          position: fixed;
          inset-block-end: 20px;
          inset-inline-end: 20px;
          z-index: 50;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #25d366, #128c50);
          box-shadow: 0 8px 24px rgba(18, 140, 80, 0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wa-fab:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 14px 30px rgba(18, 140, 80, 0.45);
        }
        .wa-fab svg {
          width: 28px;
          height: 28px;
        }

        /* ---------- כותרת מקטע ---------- */
        .blog-section-title {
          font-size: clamp(1.35rem, 4.5vw, 1.7rem);
          color: var(--brand);
          letter-spacing: -0.01em;
          margin: 0 0 1.1rem;
        }

        /* ---------- כרטיס היכרות ---------- */
        .about-card {
          display: flex;
          align-items: center;
          gap: 18px;
          background: #fff;
          border-radius: var(--card-radius);
          box-shadow: var(--card-shadow);
          border: var(--card-border);
          padding: 20px;
          margin: 8px 0 24px;
        }
        .about-photo {
          flex: none;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--brand-3);
          box-shadow: 0 6px 18px rgba(161, 23, 56, 0.18);
        }
        .about-name {
          font-size: 1.15rem;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .about-text p {
          margin: 0;
          color: var(--ink);
          font-size: 0.98rem;
          line-height: 1.65;
        }

        /* ---------- באנר הנחה ---------- */
        .discount-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(120deg, #fdece5, #f7c1c3);
          border: 1px solid rgba(161, 23, 56, 0.12);
          border-radius: 20px;
          padding: 16px 20px;
          margin: 24px 0;
          box-shadow: 0 8px 24px rgba(161, 23, 56, 0.1);
        }
        .discount-heart {
          flex: none;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff;
          color: var(--brand);
          box-shadow: 0 4px 12px rgba(161, 23, 56, 0.18);
        }
        .discount-heart svg {
          width: 22px;
          height: 22px;
          animation: heart-pulse 1.7s ease-in-out infinite;
        }
        .discount-banner p {
          margin: 0;
          color: var(--brand);
          font-size: 0.98rem;
          line-height: 1.6;
        }
        @keyframes heart-pulse {
          0%, 100% { transform: scale(1); }
          45% { transform: scale(1.15); }
        }

        /* ---------- גלריית עבודות ---------- */
        .gallery {
          margin: 40px 0;
        }
        .gallery-wrap {
          position: relative;
        }
        .gallery-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 4px 2px;
          scrollbar-width: none;
        }
        .gallery-track::-webkit-scrollbar {
          display: none;
        }
        .gallery-slide {
          flex: 0 0 auto;
          width: min(78%, 290px);
          scroll-snap-align: center;
        }
        .gallery-slide img {
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: var(--card-shadow);
          border: var(--card-border);
        }
        .gallery-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.92);
          color: var(--brand);
          box-shadow: 0 6px 18px rgba(161, 23, 56, 0.2);
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .gallery-arrow:hover {
          transform: translateY(-50%) scale(1.08);
        }
        .gallery-arrow svg {
          width: 22px;
          height: 22px;
        }
        .gallery-prev {
          inset-inline-start: 8px;
        }
        .gallery-prev svg {
          transform: rotate(-90deg);
        }
        .gallery-next {
          inset-inline-end: 8px;
        }
        .gallery-next svg {
          transform: rotate(90deg);
        }
        .gallery-dots {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 7px;
          margin-top: 16px;
        }
        .gallery-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand-3);
          transition: transform 0.25s ease, background 0.25s ease, width 0.25s ease;
        }
        .gallery-dot.is-active {
          background: var(--brand);
          width: 20px;
          border-radius: 999px;
        }
        .gallery-hint {
          text-align: center;
          color: var(--ink-soft);
          font-size: 0.85rem;
          margin: 10px 0 0;
        }

        /* ---------- reveal בגלילה ---------- */
        .reveal {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .reveal.is-visible {
          opacity: 1;
          transform: none;
        }

        @media (min-width: 640px) {
          .price-grid {
            grid-template-columns: 1fr 1fr;
          }
          .gallery-slide {
            width: 260px;
          }
          .gallery-arrow {
            display: flex;
          }
          .about-photo {
            width: 112px;
            height: 112px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .blog-root *,
          .reveal {
            transition: none !important;
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  );
}
