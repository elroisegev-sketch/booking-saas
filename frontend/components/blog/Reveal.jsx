import { useEffect, useRef, useState } from "react";

// עוטף תוכן ומחיל fade-in עדין כשהאלמנט נכנס לתצוגה בגלילה.
// עקרונות עמידות: ב-SSR התוכן מרונדר גלוי (ידידותי לקריאה בלי JS ולסורקים);
// עם JS מסתירים ומגלים בגלילה, עם fallback טיימר כדי שהתוכן לעולם לא יישאר מוסתר.
export default function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState("ssr"); // ssr | hidden | shown

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setPhase("shown");
      return;
    }
    setPhase("hidden");
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      setPhase("shown");
      io.disconnect();
      clearTimeout(timer);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && reveal()),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(el);
    // ביטוח: אם מסיבה כלשהי ה-observer לא נורה, מגלים בכל מקרה
    const timer = setTimeout(reveal, 900);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const cls =
    phase === "ssr"
      ? className
      : `reveal ${phase === "shown" ? "is-visible" : ""} ${className}`;

  return (
    <Tag
      ref={ref}
      className={cls}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
