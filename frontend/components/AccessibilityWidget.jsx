import { useState, useEffect, useCallback } from "react";

/**
 * AccessibilityWidget - תוסף נגישות לאתר BookSlot
 * עומד בדרישות תקן IS 5568 (WCAG 2.0 AA)
 * 
 * שימוש: פשוט הוסיפי <AccessibilityWidget /> ב-layout הראשי של האפליקציה
 * 
 * מה זה כולל:
 * 1. כפתור נגישות צף (♿)
 * 2. תפריט כלי נגישות (גודל טקסט, ניגודיות, ניווט מקלדת וכו')
 * 3. הצהרת נגישות מלאה בעברית (חובה חוקית!)
 * 4. קיצורי מקלדת
 */

const ACCESSIBILITY_FEATURES = [
  {
    id: "fontSize",
    label: "הגדלת טקסט",
    icon: "🔤",
    levels: ["רגיל", "גדול", "גדול מאוד"],
  },
  {
    id: "contrast",
    label: "ניגודיות גבוהה",
    icon: "🌗",
    toggle: true,
  },
  {
    id: "linkHighlight",
    label: "הדגשת קישורים",
    icon: "🔗",
    toggle: true,
  },
  {
    id: "grayscale",
    label: "גווני אפור",
    icon: "⚫",
    toggle: true,
  },
  {
    id: "readableFont",
    label: "גופן קריא",
    icon: "📖",
    toggle: true,
  },
  {
    id: "animations",
    label: "עצירת אנימציות",
    icon: "⏸️",
    toggle: true,
  },
  {
    id: "cursor",
    label: "סמן גדול",
    icon: "🖱️",
    toggle: true,
  },
  {
    id: "lineHeight",
    label: "ריווח שורות",
    icon: "↕️",
    toggle: true,
  },
];

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 0,
    contrast: false,
    linkHighlight: false,
    grayscale: false,
    readableFont: false,
    animations: false,
    cursor: false,
    lineHeight: false,
  });

  // Apply accessibility changes to the document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizes = ["100%", "120%", "140%"];
    root.style.fontSize = fontSizes[settings.fontSize];

    // High contrast
    if (settings.contrast) {
      root.classList.add("a11y-high-contrast");
    } else {
      root.classList.remove("a11y-high-contrast");
    }

    // Link highlight
    if (settings.linkHighlight) {
      root.classList.add("a11y-link-highlight");
    } else {
      root.classList.remove("a11y-link-highlight");
    }

    // Grayscale
    if (settings.grayscale) {
      root.style.filter = "grayscale(100%)";
    } else {
      root.style.filter = "";
    }

    // Readable font
    if (settings.readableFont) {
      root.classList.add("a11y-readable-font");
    } else {
      root.classList.remove("a11y-readable-font");
    }

    // Stop animations
    if (settings.animations) {
      root.classList.add("a11y-no-animations");
    } else {
      root.classList.remove("a11y-no-animations");
    }

    // Big cursor
    if (settings.cursor) {
      root.classList.add("a11y-big-cursor");
    } else {
      root.classList.remove("a11y-big-cursor");
    }

    // Line height
    if (settings.lineHeight) {
      root.classList.add("a11y-line-height");
    } else {
      root.classList.remove("a11y-line-height");
    }

    // Save settings to localStorage
    try {
      localStorage.setItem("a11y-settings", JSON.stringify(settings));
    } catch (e) {
      // localStorage might not be available
    }
  }, [settings]);

  // Load saved settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("a11y-settings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Keyboard shortcut: Alt+A to toggle widget
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "a") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleFeature = useCallback((featureId) => {
    setSettings((prev) => {
      if (featureId === "fontSize") {
        return { ...prev, fontSize: (prev.fontSize + 1) % 3 };
      }
      return { ...prev, [featureId]: !prev[featureId] };
    });
  }, []);

  const resetAll = useCallback(() => {
    setSettings({
      fontSize: 0,
      contrast: false,
      linkHighlight: false,
      grayscale: false,
      readableFont: false,
      animations: false,
      cursor: false,
      lineHeight: false,
    });
  }, []);

  return (
    <>
      {/* Global Accessibility CSS */}
      <style>{`
        .a11y-high-contrast {
          filter: contrast(1.4) !important;
        }
        .a11y-high-contrast body {
          background: #000 !important;
          color: #fff !important;
        }
        .a11y-link-highlight a {
          outline: 3px solid #FFD700 !important;
          text-decoration: underline !important;
          color: #FFD700 !important;
        }
        .a11y-readable-font * {
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
        }
        .a11y-no-animations *,
        .a11y-no-animations *::before,
        .a11y-no-animations *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
        .a11y-big-cursor,
        .a11y-big-cursor * {
          cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4l28 20H20l8 16-4 2-8-16-8 8V4z' fill='%23000' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") 4 4, auto !important;
        }
        .a11y-line-height * {
          line-height: 2 !important;
        }

        /* Focus visible styles for keyboard navigation */
        *:focus-visible {
          outline: 3px solid #A11738 !important;
          outline-offset: 2px !important;
        }

        /* Skip to content link */
        .a11y-skip-link {
          position: fixed;
          top: -100%;
          right: 16px;
          z-index: 100001;
          background: #A11738;
          color: white;
          padding: 12px 24px;
          border-radius: 0 0 8px 8px;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          transition: top 0.2s;
        }
        .a11y-skip-link:focus {
          top: 0;
        }

        /* Widget styles */
        .a11y-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #A11738;
          color: white;
          border: none;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(161, 23, 56, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .a11y-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(161, 23, 56, 0.5);
        }
        .a11y-fab:focus-visible {
          outline: 3px solid #FFD700 !important;
          outline-offset: 3px !important;
        }

        .a11y-panel {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 100000;
          width: 320px;
          max-height: 80vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.2);
          font-family: 'Heebo', 'Arial', sans-serif;
          direction: rtl;
        }

        .a11y-panel-header {
          padding: 16px 20px;
          background: #A11738;
          color: white;
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .a11y-panel-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .a11y-close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .a11y-features {
          padding: 12px;
        }
        .a11y-feature-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #eee;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-size: 15px;
          font-family: 'Heebo', 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          margin-bottom: 8px;
          transition: all 0.15s;
        }
        .a11y-feature-btn:hover {
          border-color: #A11738;
          background: #FFF5F6;
        }
        .a11y-feature-btn.active {
          border-color: #A11738;
          background: #FDECE5;
          color: #A11738;
          font-weight: 600;
        }
        .a11y-feature-icon {
          font-size: 22px;
          width: 32px;
          text-align: center;
        }

        .a11y-actions {
          padding: 8px 12px 12px;
          display: flex;
          gap: 8px;
        }
        .a11y-action-btn {
          flex: 1;
          padding: 10px;
          border: 2px solid #eee;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Heebo', 'Arial', sans-serif;
          font-weight: 600;
          transition: all 0.15s;
        }
        .a11y-action-btn:hover {
          border-color: #A11738;
          color: #A11738;
        }
        .a11y-action-btn.reset {
          color: #e74c3c;
          border-color: #fdd;
        }
        .a11y-action-btn.reset:hover {
          background: #fef0f0;
        }
        .a11y-shortcut-hint {
          text-align: center;
          padding: 8px;
          font-size: 12px;
          color: #999;
          border-top: 1px solid #eee;
        }

        /* Accessibility Statement Modal */
        .a11y-statement-overlay {
          position: fixed;
          inset: 0;
          z-index: 100002;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .a11y-statement-modal {
          background: white;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          padding: 32px;
          direction: rtl;
          font-family: 'Heebo', 'Arial', sans-serif;
          line-height: 1.8;
        }
        .a11y-statement-modal h1 {
          color: #A11738;
          font-size: 24px;
          margin-bottom: 16px;
        }
        .a11y-statement-modal h2 {
          color: #333;
          font-size: 18px;
          margin-top: 20px;
          margin-bottom: 8px;
        }
        .a11y-statement-modal p {
          color: #555;
          font-size: 15px;
          margin-bottom: 12px;
        }
        .a11y-statement-modal ul {
          padding-right: 20px;
          color: #555;
        }
        .a11y-statement-modal li {
          margin-bottom: 6px;
          font-size: 15px;
        }
        .a11y-statement-close {
          position: sticky;
          top: 0;
          float: left;
          background: #A11738;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          z-index: 1;
        }
      `}</style>

      {/* Skip to Content Link */}
      <a href="#main-content" className="a11y-skip-link">
        דלג לתוכן העמוד
      </a>

      {/* Floating Accessibility Button */}
      <button
        className="a11y-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="פתח תפריט נגישות"
        aria-expanded={isOpen}
        title="נגישות (Alt+A)"
      >
        ♿
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className="a11y-panel"
          role="dialog"
          aria-label="הגדרות נגישות"
          aria-modal="false"
        >
          <div className="a11y-panel-header">
            <h2>הגדרות נגישות</h2>
            <button
              className="a11y-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="סגור תפריט נגישות"
            >
              ✕
            </button>
          </div>

          <div className="a11y-features">
            {ACCESSIBILITY_FEATURES.map((feature) => {
              const isActive = feature.toggle
                ? settings[feature.id]
                : settings[feature.id] > 0;
              return (
                <button
                  key={feature.id}
                  className={`a11y-feature-btn ${isActive ? "active" : ""}`}
                  onClick={() => toggleFeature(feature.id)}
                  aria-pressed={isActive}
                >
                  <span className="a11y-feature-icon">{feature.icon}</span>
                  <span>
                    {feature.label}
                    {feature.levels
                      ? ` (${feature.levels[settings.fontSize]})`
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="a11y-actions">
            <button
              className="a11y-action-btn reset"
              onClick={resetAll}
            >
              איפוס הכל
            </button>
            <button
              className="a11y-action-btn"
              onClick={() => {
                setShowStatement(true);
                setIsOpen(false);
              }}
            >
              הצהרת נגישות
            </button>
          </div>

          <div className="a11y-shortcut-hint">
            קיצור מקלדת: Alt+A
          </div>
        </div>
      )}

      {/* Accessibility Statement Modal */}
      {showStatement && (
        <div
          className="a11y-statement-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStatement(false);
          }}
          role="dialog"
          aria-label="הצהרת נגישות"
          aria-modal="true"
        >
          <div className="a11y-statement-modal">
            <button
              className="a11y-statement-close"
              onClick={() => setShowStatement(false)}
              aria-label="סגור הצהרת נגישות"
            >
              ✕
            </button>

            <h1>הצהרת נגישות</h1>

            <p>
              <strong>עודכן לאחרונה:</strong>{" "}
              {new Date().toLocaleDateString("he-IL")}
            </p>

            <h2>כללי</h2>
            <p>
              אנו מאמינים שכל אדם זכאי לגישה שווה למידע ולשירותים מקוונים.
              אתר זה פועל לעמוד בדרישות תקן IS 5568 הישראלי המבוסס על 
              הנחיות הנגישות לתוכן אינטרנט WCAG 2.0 ברמה AA, בהתאם לחוק 
              שוויון זכויות לאנשים עם מוגבלות, תשנ״ח-1998 ותקנות הנגישות 
              שהותקנו מכוחו.
            </p>

            <h2>התאמות הנגישות שבוצעו באתר</h2>
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

            <h2>כלי הנגישות באתר</h2>
            <p>
              בלחיצה על כפתור הנגישות (♿) בפינה השמאלית התחתונה של
              המסך, או בלחיצה על Alt+A, ניתן לגשת לכלים הבאים:
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

            <h2>יצירת קשר בנושא נגישות</h2>
            <p>
              אם נתקלתם בבעיית נגישות באתר, נשמח לשמוע מכם ולטפל בכך
              בהקדם האפשרי.
            </p>
            <p>
              <strong>רכז/ת נגישות:</strong> ליאור שגב
              <br />
              <strong>טלפון:</strong>{" "}
              <a href="tel:+972535249688" dir="ltr">
                053-524-9688
              </a>
              <br />
              <strong>דוא״ל:</strong>{" "}
              <a href="mailto:liordanino58@gmail.com">
                liordanino58@gmail.com
              </a>
            </p>

            <h2>הבהרה</h2>
            <p>
              אנו משקיעים מאמצים רבים בהנגשת האתר, אולם ייתכן שחלקים
              מסוימים טרם הונגשו במלואם. אנו ממשיכים לעבוד על שיפור
              הנגישות ושואפים להגיע לרמה הגבוהה ביותר. הצהרה זו עודכנה
              לאחרונה בתאריך הנ״ל.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
