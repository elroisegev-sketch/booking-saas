import Reveal from "./Reveal";

// כרטיס היכרות בראש המאמר: תמונת פרופיל מעוגלת + שתי-שלוש שורות בגוף ראשון.
export default function AboutLior() {
  return (
    <Reveal className="about-card">
      <img
        className="about-photo"
        src="/images/blog/lior.webp"
        width="128"
        height="128"
        alt="ליאור שגב, מעצבת ציפורניים בגבעת שמואל"
      />
      <div className="about-text">
        <div className="about-name">היי, אני ליאור</div>
        <p>
          אני עושה ציפורניים בגבעת שמואל כבר כמה שנים — לקוחה אחת בכל פעם, בלי
          למהר. אוהבת עבודה נקייה שמחזיקה, וידיים שבא לך להסתכל עליהן.
        </p>
      </div>
    </Reveal>
  );
}
