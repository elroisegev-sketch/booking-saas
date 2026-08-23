// תיק עבודות UGC — קבצים מקומיים מתיקיית "סרטוני  - ugc".
// אפשר גם להחליף לקישור טיקטוק/אינסטגרם בשדה url.

export const UGC_VIDEOS = [
  { id: "inspiration", title: "השראה", category: "השראה", tags: ["lifestyle"], url: "/ugc/01.mp4" },
  { id: "unboxing", title: "אנבוקסינג", category: "אנבוקסינג", tags: ["unboxing"], url: "/ugc/02.mp4" },
  { id: "fashion", title: "אופנה", category: "אופנה", tags: ["fashion"], url: "/ugc/03.mp4" },
  { id: "day-vo", title: "יום בחיי + Voice Over", category: "וולוגים", tags: ["vo", "lifestyle"], url: "/ugc/04.mp4" },
  { id: "recipes", title: "מתכונים", category: "לייף סטייל", tags: ["lifestyle"], url: "/ugc/05.mp4" },
  { id: "review", title: "סקירת מוצר", category: "UGC", tags: ["ugc"], url: "/ugc/06.mp4" },
  { id: "beautycare-asmr", title: "אנבוקסינג ביוטיקייר", category: "אנבוקסינג", tags: ["unboxing"], url: "/ugc/07.mp4" },
  { id: "sheek-me", title: "שת״פ sheek me", category: "UGC", tags: ["ugc", "fashion"], url: "/ugc/08.mp4" },
  { id: "asmr-unbox", title: "אנבוקסינג ASMR", category: "אנבוקסינג", tags: ["unboxing"], url: "/ugc/09.mp4" },
  { id: "grwm-makeup", title: "GRWM איפור", category: "GRWM", tags: ["grwm"], url: "/ugc/10.mp4" },
  { id: "fashion-2", title: "אופנה", category: "אופנה", tags: ["fashion"], url: "/ugc/11.mp4" },
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
