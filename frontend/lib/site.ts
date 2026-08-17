// הגדרות מרכזיות של האתר — כתובת, פרטי קשר, וואטסאפ, פרטי העסק.
// כל מקום במדור הבלוג שצריך פרט כזה מושך אותו מכאן, כדי שלא יהיו כפילויות.

export const site = {
  name: "ליאור שגב | ציפורניים",
  legalName: "ליאור שגב – היופי שלך",
  domain: "www.lioryourbeauty.com",
  url: "https://www.lioryourbeauty.com",
  locale: "he-IL",
  description:
    "מכון הציפורניים של ליאור שגב בגבעת שמואל. לק ג'ל, מניקור, מבנה אנטומי ועיצוב גבות. לקביעת תור באתר או בוואטסאפ.",
  // מספר וואטסאפ בפורמט בינלאומי (972) + מספר מקומי לתצוגה
  whatsapp: "972535249688",
  phoneDisplay: "053-524-9688",
  address: {
    street: "הרב הרצוג 25",
    city: "גבעת שמואל",
    region: "מחוז המרכז",
    postalCode: "5401773",
    country: "IL",
  },
  // קואורדינטות של הרב הרצוג 25, גבעת שמואל (רמת רחוב, מתוך OpenStreetMap)
  geo: {
    lat: 32.075379,
    lng: 34.845833,
  },
  // שעות שמופיעות לקהל (NAP). הזמינות ביומן התורים יכולה להיות מדויקת יותר ליום.
  hours: [
    {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      open: "10:00",
      close: "18:00",
    },
  ],
  priceRange: "₪₪",
  social: {
    instagram: "https://instagram.com/liors_beauty",
    facebook: "https://www.facebook.com/share/1DLKLrkWFb/",
  },
} as const;

// בונה קישור וואטסאפ עם הודעה מוכנה מראש
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
