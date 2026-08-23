import { getAllPosts } from "../lib/posts";
import { site } from "../lib/site";

// sitemap.xml דינמי — כולל את העמודים הקיימים של האתר וגם את עמודי הבלוג.
// נבנה בצד השרת בכל בקשה כדי לשקף פוסטים חדשים אוטומטית.

// העמודים הסטטיים הקיימים באתר (ללא admin/maintenance/api)
const STATIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/ugc", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/accessibility", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

function buildXml() {
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = STATIC_ROUTES.map(
    (r) => `  <url>
    <loc>${site.url}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  );

  const postUrls = getAllPosts().map((post) => {
    const lastmod = (post.frontmatter.updated || post.frontmatter.date || today).slice(0, 10);
    return `  <url>
    <loc>${site.url}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...postUrls].join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(buildXml());
  res.end();
  return { props: {} };
}

export default function SiteMap() {
  // getServerSideProps מחזיר את ה-XML ישירות; הרכיב לא מוצג.
  return null;
}
