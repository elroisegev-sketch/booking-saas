#!/usr/bin/env python3
"""
סוכן תוכן אינסטגרם — סלון ליאור שגב
מריץ כל בוקר ומייצר תוכן יומי מוכן לפרסום
"""

import anthropic
import json
from datetime import datetime

# ← קרא את המפתח ממשתנה סביבה
import os
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """את מנהלת שיווק מקצועית של סלון יופי בישראל בשם "ליאור שגב".
הסלון מתמחה בשלושה שירותים בלבד: לק גל, הרמת ריסים, הרמת גבות.

כללים לכתיבה:
- עברית מדוברת, חמה, ישירה — לא פורמלית
- טון: חברה טובה שנותנת עצה, לא מכירות
- תמיד תוכן שמעביר ידע או ערך — ככה הצופה נשארת
- אין אמוג'י מוגזמים — מקסימום 2-3 בפוסט
- האשטגים בעברית בלבד (ללא קו תחתון)
- קהל יעד: נשים 20-45 בישראל"""


def generate_daily_content():
    client = anthropic.Anthropic(api_key=API_KEY)

    today = datetime.now()
    day_name = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][today.weekday()]
    date_str = today.strftime("%d/%m/%Y")

    print(f"\n✨ סוכן תוכן אינסטגרם — {date_str} (יום {day_name})\n")
    print("=" * 50)

    # --- פוסט טקסטואלי ---
    print("\n📝 פוסט טקסטואלי לאינסטגרם:\n")

    post_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=600,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"""כתבי פוסט אינסטגרם אחד ליום {day_name}.
בחרי בעצמך נושא מתוך: לק גל / הרמת ריסים / הרמת גבות.
הפוסט צריך להעביר ידע שימושי שגורם לנשים לשמור אותו.
פורמט:
- שורה פותחת שמושכת תשומת לב (hook)
- 3-4 שורות תוכן עם ערך
- קריאה לפעולה קצרה
- 5 האשטגים רלוונטיים
"""
        }]
    )
    print(post_response.content[0].text)

    # --- רעיון לרילס ---
    print("\n" + "=" * 50)
    print("\n🎬 רעיון לרילס השבוע:\n")

    reel_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=500,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": """תני רעיון אחד מפורט לרילס שמחנכת ומשאירה צופות.
פורמט:
- כותרת הרילס
- ה-hook (מה ליאור אומרת בשנייה הראשונה)
- מה מראים בסרטון (5-6 שלבים קצרים)
- קאפשן + האשטגים
"""
        }]
    )
    print(reel_response.content[0].text)

    # --- סטורי ---
    print("\n" + "=" * 50)
    print("\n📱 רעיון לסטורי:\n")

    story_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=300,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"""תני רעיון קצר לסטורי אינסטגרם ליום {day_name}.
יכול להיות: שאלה לקהל / טיפ מהיר / לפני-אחרי / סקר
פורמט:
- סוג הסטורי
- הטקסט המדויק שיופיע
- אם יש סקר — 2 אפשרויות תשובה
"""
        }]
    )
    print(story_response.content[0].text)

    print("\n" + "=" * 50)
    print(f"\n✅ התוכן מוכן! העתיקי ופרסמי 🎀\n")


if __name__ == "__main__":
    if API_KEY == "YOUR_ANTHROPIC_API_KEY":
        print("❌ שגיאה: הוסיפי את מפתח ה-API שלך בשורה 14 של הקובץ")
        print("   נרשמים ב: console.anthropic.com → API Keys → Create Key")
    else:
        generate_daily_content()
