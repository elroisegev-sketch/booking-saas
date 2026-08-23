// תיק עבודות UGC — כשתהיה קישור לסרטון, הדביקי אותו ב-url.
// עובד עם טיקטוק, אינסטגרם, או קובץ מקומי (למשל /ugc/grwm.mp4).

export const UGC_VIDEOS = [
  { id: "inspiration", title: "השראה", category: "השראה", url: "" },
  { id: "unboxing", title: "אנבוקסינג", category: "אנבוקסינג", url: "" },
  { id: "fashion", title: "אופנה", category: "אופנה", url: "" },
  { id: "day-vo", title: "יום בחיי + Voice Over", category: "וולוגים", url: "" },
  { id: "recipes", title: "מתכונים", category: "לייף סטייל", url: "" },
  { id: "review", title: "סקירת מוצר", category: "UGC", url: "" },
  { id: "beautycare-asmr", title: "אנבוקסינג ביוטיקייר", category: "אנבוקסינג", url: "" },
  { id: "sheek-me", title: "שת״פ sheek me", category: "UGC", url: "" },
  { id: "asmr-unbox", title: "אנבוקסינג ASMR", category: "אנבוקסינג", url: "" },
  { id: "grwm-makeup", title: "GRWM איפור", category: "GRWM", url: "" },
  { id: "fashion-2", title: "אופנה", category: "אופנה", url: "" },
];

export function resolveVideo(item) {
  const url = (item.url || "").trim();
  if (!url) return { ...item, kind: "empty" };

  if (url.startsWith("/") || url.endsWith(".mp4") || url.endsWith(".webm")) {
    return { ...item, kind: "file", src: url };
  }

  const tiktok = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktok) {
    return { ...item, kind: "embed", src: `https://www.tiktok.com/embed/v2/${tiktok[1]}` };
  }

  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([^/?]+)/);
  if (ig) {
    return { ...item, kind: "embed", src: `https://www.instagram.com/${ig[1]}/${ig[2]}/embed` };
  }

  return { ...item, kind: "link", src: url };
}
