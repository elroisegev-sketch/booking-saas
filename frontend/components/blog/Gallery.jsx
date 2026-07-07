import { useRef, useState, useEffect } from "react";
import { ChevronIcon } from "./icons";

// כמות התמונות בתיקיית public/images/gallery (01.webp ... NN.webp)
const COUNT = 21;
const IMAGES = Array.from({ length: COUNT }, (_, i) => String(i + 1).padStart(2, "0"));

// קרוסלת עבודות אופקית RTL: swipe בטאץ', חיצים בדסקטופ, נקודות אינדיקציה,
// lazy-loading, וגלילה חלקה עם scroll-snap.
export default function Gallery() {
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const [active, setActive] = useState(0);

  const go = (i) => {
    const idx = Math.max(0, Math.min(COUNT - 1, i));
    const el = slideRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(idx);
  };

  // מסנכרן את הנקודה הפעילה עם הגלילה/swipe
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        }),
      { root: track, threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className="gallery">
      <h2 className="blog-section-title">עבודות מהקליניקה</h2>

      <div className="gallery-wrap">
        <button
          type="button"
          className="gallery-arrow gallery-prev"
          onClick={() => go(active - 1)}
          aria-label="התמונה הקודמת"
        >
          <ChevronIcon />
        </button>

        <div className="gallery-track" ref={trackRef}>
          {IMAGES.map((n, i) => (
            <div
              className="gallery-slide"
              key={n}
              data-i={i}
              ref={(el) => (slideRefs.current[i] = el)}
            >
              <img
                src={`/images/gallery/${n}.webp`}
                loading="lazy"
                decoding="async"
                width="600"
                height="800"
                alt={`עבודת לק ג'ל וציפורניים של ליאור שגב בגבעת שמואל — ${i + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="gallery-arrow gallery-next"
          onClick={() => go(active + 1)}
          aria-label="התמונה הבאה"
        >
          <ChevronIcon />
        </button>
      </div>

      {/* נקודות אינדיקציה עדינות (תצוגה בלבד; הניווט בטאץ' swipe או בחיצים) */}
      <div className="gallery-dots" aria-hidden="true">
        {IMAGES.map((_, i) => (
          <span key={i} className={`gallery-dot ${i === active ? "is-active" : ""}`} />
        ))}
      </div>
      <p className="gallery-hint">
        החליקי לצדדים לגלריה המלאה · {active + 1}/{COUNT}
      </p>
    </section>
  );
}
