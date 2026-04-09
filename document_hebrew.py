#!/usr/bin/env python3
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
from reportlab.lib import colors
from bidi.algorithm import get_display
from datetime import datetime

FONT_REG = "/Users/elroisegev/Library/Fonts/Rubik-Regular.ttf"
FONT_BOLD = "/Users/elroisegev/Library/Fonts/Rubik-Bold.ttf"
LOGO_PATH = "/Users/elroisegev/Desktop/beauty-booking/frontend/public/logo-pink.png"
OUTPUT = "/Users/elroisegev/Desktop/beauty-booking/דוח_לקוחות.pdf"

pdfmetrics.registerFont(TTFont("Rubik", FONT_REG))
pdfmetrics.registerFont(TTFont("Rubik-Bold", FONT_BOLD))

def rtl(text):
    return get_display(str(text))

c = canvas.Canvas(OUTPUT, pagesize=A4)
w, h = A4
R = w - 20*mm   # right margin x
L = 20*mm        # left margin x

# ── לוגו פינה ימנית עליונה ──
c.drawImage(LOGO_PATH, R - 40*mm, h - 28*mm, width=38*mm, height=18*mm,
            preserveAspectRatio=True, mask='auto')

# ── קו עליון ──
c.setStrokeColor(colors.HexColor("#A11738"))
c.setLineWidth(1.5)
c.line(L, h - 33*mm, R, h - 33*mm)

# ── כותרת ──
c.setFont("Rubik-Bold", 22)
c.setFillColor(colors.HexColor("#A11738"))
c.drawRightString(R, h - 47*mm, rtl("דוח לקוחות — רבעון ראשון 2026"))

# ── תאריך ──
c.setFont("Rubik", 10)
c.setFillColor(colors.HexColor("#6b7280"))
today = datetime.now().strftime("%d/%m/%Y")
c.drawRightString(R, h - 55*mm, rtl(f"תאריך הפקה: {today}"))

# ── גוף טקסט ──
c.setFont("Rubik", 11)
c.setFillColor(colors.black)
body_lines = [
    "הדוח שלפניך מסכם את פעילות הלקוחות בסלון בין ינואר למרץ 2026.",
    "בתקופה זו נרשמה עלייה של 18% במספר הלקוחות החדשות,",
    "ועלייה של 24% בהכנסות הכוללות לעומת הרבעון המקביל אשתקד.",
    "הטיפולים הפופולריים ביותר היו: צביעה, החלקה ותספורת.",
]
y = h - 68*mm
for line in body_lines:
    c.drawRightString(R, y, rtl(line))
    y -= 7*mm

# ── קו הפרדה ──
y -= 4*mm
c.setStrokeColor(colors.HexColor("#F7C1C3"))
c.setLineWidth(1)
c.line(L, y, R, y)
y -= 10*mm

# ── כותרת טבלה ──
c.setFont("Rubik-Bold", 12)
c.setFillColor(colors.HexColor("#A11738"))
c.drawRightString(R, y, rtl("פירוט לקוחות"))
y -= 10*mm

# ── כותרות עמודות ──
col_positions = [R, R - 55*mm, R - 105*mm, R - 145*mm]
headers = ["שם לקוחה", "טיפול אחרון", "מספר ביקורים", "סכום כולל"]

header_bg_y = y - 2*mm
c.setFillColor(colors.HexColor("#FFF0F3"))
c.rect(L, header_bg_y, w - 40*mm, 9*mm, fill=1, stroke=0)

c.setFont("Rubik-Bold", 10)
c.setFillColor(colors.HexColor("#A11738"))
for col_x, header in zip(col_positions, headers):
    c.drawRightString(col_x, y, rtl(header))
y -= 10*mm

# ── שורות טבלה ──
rows = [
    ("נועה כהן",      "צביעה שורשים",    "12", "1,440 ₪"),
    ("מיכל לוי",      "החלקה קרטין",     "7",  "3,150 ₪"),
    ("שירה אברמוב",   "תספורת ופן",       "9",  "810 ₪"),
    ("דנה גולדברג",   "טיפול קרניטין",    "5",  "2,250 ₪"),
    ("יעל שמואלי",    "צביעה בלונד",      "11", "4,950 ₪"),
    ("אורית מזרחי",   "גוונים + תספורת", "8",  "2,880 ₪"),
]

c.setFont("Rubik", 10)
for i, (name, treatment, visits, total) in enumerate(rows):
    if i % 2 == 0:
        c.setFillColor(colors.HexColor("#FAFAFA"))
        c.rect(L, y - 2*mm, w - 40*mm, 8*mm, fill=1, stroke=0)
    c.setFillColor(colors.black)
    for col_x, val in zip(col_positions, [name, treatment, visits, total]):
        c.drawRightString(col_x, y, rtl(val))
    y -= 8.5*mm

# ── קו תחתון טבלה ──
c.setStrokeColor(colors.HexColor("#F7C1C3"))
c.setLineWidth(1)
c.line(L, y + 3*mm, R, y + 3*mm)

# ── סיכום ──
y -= 8*mm
c.setFont("Rubik-Bold", 11)
c.setFillColor(colors.HexColor("#A11738"))
c.drawRightString(R, y, rtl("סה\"כ הכנסות רבעון: 15,480 ₪"))

# ── פוטר ──
c.setFont("Rubik", 8)
c.setFillColor(colors.HexColor("#9ca3af"))
c.drawRightString(R, 15*mm, rtl("ליאור שגב | סטודיו לעיצוב שיער | מסמך פנימי בלבד"))
c.drawString(L, 15*mm, today)

c.save()
print(f"PDF נוצר בהצלחה: {OUTPUT}")
