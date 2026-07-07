import Reveal from "./Reveal";

// באנר הנחה מכבד לנשות מילואים / חיילות / בנות שירות לאומי.
// רקע גרדיאנט עדין מהפלטה, אייקון לב עם פעימה, כניסת fade+slide.
export default function DiscountBanner() {
  return (
    <Reveal className="discount-banner">
      <span className="discount-heart" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20.5s-7.2-4.35-9.33-8.5C1.4 9.28 2.7 6 5.9 6c1.9 0 3.2 1.1 4.1 2.4C10.9 7.1 12.2 6 14.1 6c3.2 0 4.5 3.28 3.23 6-2.13 4.15-9.33 8.5-9.33 8.5Z" />
        </svg>
      </span>
      <p>
        תודה ענקית לנשות מילואים, לחיילות ולבנות שירות לאומי. מגיעה לכן הנחה
        אצלי — רק ספרי לי כשאת קובעת תור.
      </p>
    </Reveal>
  );
}
