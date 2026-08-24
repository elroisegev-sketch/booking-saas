// תיק עבודות UGC — שמות לפי מה שמופיע בסרטון.
// אפשר גם להחליף לקישור טיקטוק/אינסטגרם בשדה url.

export const UGC_VIDEOS = [
  { id: "day-manicurist", title: "יום בחיי מניקוריסטית", url: "/ugc/01.mp4" },
  { id: "pesach-look", title: "לוק צנוע לפסח", url: "/ugc/02.mp4" },
  { id: "manicure-haul", title: "הול למניקור", url: "/ugc/03.mp4" },
  { id: "peel-lipstick", title: "אודם מתקלף", url: "/ugc/04.mp4" },
  { id: "shabbat-dessert", title: "קינוח לשבת", url: "/ugc/05.mp4" },
  { id: "etcasia", title: "שת״פ ETCASIA", url: "/ugc/06.mp4" },
  { id: "beautycare", title: "אנבוקסינג Beautycare", url: "/ugc/07.mp4" },
  { id: "asmr-unbox", title: "אנבוקסינג ASMR", url: "/ugc/08.mp4" },
  { id: "modest-look", title: "לוק צנוע", url: "/ugc/09.mp4" },
  { id: "tie-tutorial", title: "מדריך קשירה", url: "/ugc/10.mp4" },
  { id: "grwm-makeup", title: "GRWM איפור", url: "/ugc/11.mp4" },
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
