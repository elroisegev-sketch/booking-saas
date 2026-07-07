// קריאת פוסטים מתיקיית content/blog. כל פוסט הוא קובץ MDX עם frontmatter.
// הפונקציות כאן משמשות את רשימת הבלוג, עמוד הפוסט וה-sitemap (בצד השרת בלבד).

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type FaqItem = { q: string; a: string };

export type PriceItem = {
  service: string;
  price: string;
  duration?: string;
  note?: string;
};

export type PostFrontmatter = {
  title: string; // עד 60 תווים — לתגית <title>
  description: string; // עד 155 תווים — meta description
  city?: string;
  keyword?: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  cover?: string;
  coverAlt?: string;
  faq?: FaqItem[];
  prices?: PriceItem[];
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string; // גוף ה-MDX (בלי ה-frontmatter)
};

function ensureDir(): boolean {
  return fs.existsSync(BLOG_DIR);
}

export function getPostSlugs(): string[] {
  if (!ensureDir()) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
  };
}

export function getAllPosts(): Post[] {
  return getPostSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is Post => p !== null)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}
