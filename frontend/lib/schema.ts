// בוני סכמות (Structured Data) — LocalBusiness, FAQPage ו-Article.
// מרכזים כאן כדי לשמור על אחידות ולמשוך פרטים מ-lib/site.

import { site } from "./site";
import type { FaqItem } from "./posts";

// סכמת LocalBusiness (מכון ציפורניים) לעמוד הבית / layout
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    "@id": `${site.url}/#business`,
    name: site.legalName,
    image: `${site.url}/favicon.png`,
    url: site.url,
    telephone: `+${site.whatsapp}`,
    priceRange: site.priceRange,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    areaServed: [
      "גבעת שמואל",
      "פתח תקווה",
      "קרית אונו",
      "גני תקווה",
      "רמת גן",
      "בני ברק",
    ],
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...h.days],
      opens: h.open,
      closes: h.close,
    })),
    sameAs: [site.social.instagram, site.social.facebook, site.social.googleMaps],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.ratingValue,
      reviewCount: String(site.reviewCount),
      bestRating: "5",
      worstRating: "1",
    },
  };
}

// סכמת FAQPage מתוך רשימת שאלות ותשובות
export function faqSchema(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

// סכמת Article לעמוד תוכן
export function articleSchema(opts: {
  title: string;
  description: string;
  slug: string;
  date: string;
  updated?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    inLanguage: "he-IL",
    datePublished: opts.date,
    dateModified: opts.updated ?? opts.date,
    mainEntityOfPage: `${site.url}/blog/${opts.slug}`,
    image: opts.image ? `${site.url}${opts.image}` : undefined,
    author: { "@type": "Person", name: "ליאור שגב" },
    publisher: {
      "@type": "Organization",
      name: site.legalName,
    },
  };
}
