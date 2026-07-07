import Head from "next/head";
import Link from "next/link";
import { getAllPosts } from "../../lib/posts";
import { site } from "../../lib/site";
import BlogShell from "../../components/blog/BlogShell";
import Reveal from "../../components/blog/Reveal";
import DiscountBanner from "../../components/blog/DiscountBanner";
import { WhatsappFab } from "../../components/blog/WhatsappButton";
import { ArrowIcon, HeartIcon } from "../../components/blog/icons";

export async function getStaticProps() {
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    frontmatter: p.frontmatter,
  }));
  return { props: { posts } };
}

function formatDate(d) {
  try {
    return new Intl.DateTimeFormat("he-IL", { year: "numeric", month: "long" }).format(
      new Date(d)
    );
  } catch {
    return d;
  }
}

export default function BlogIndex({ posts }) {
  const canonical = `${site.url}/blog`;
  return (
    <>
      <Head>
        <title>מדריכים ללק ג'ל ומניקור | ליאור שגב</title>
        <meta
          name="description"
          content="מדריכים וטיפים על לק ג'ל, מניקור ובנייה בג'ל — מהניסיון של ליאור שגב מגבעת שמואל."
        />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="he-IL" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:title" content="מדריכים ללק ג'ל ומניקור | ליאור שגב" />
        <meta property="og:url" content={canonical} />
      </Head>

      <BlogShell>
        <header className="blog-wrap" style={{ textAlign: "center", paddingBlock: "56px 20px" }}>
          <Reveal>
            <span className="blog-eyebrow">
              <HeartIcon className="w-4 h-4" />
              המדריכים של ליאור
            </span>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="blog-title" style={{ marginTop: "1rem" }}>
              לק ג'ל ומניקור, בלי חצי אמיתות
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: "1.1rem", maxWidth: 460, margin: "0.6rem auto 0" }}>
              מה שאני מסבירה ללקוחות שלי על הכיסא, עכשיו גם כאן.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/" className="back-link" style={{ marginTop: "1.4rem" }}>
              <ArrowIcon />
              חזרה לקביעת תור
            </Link>
          </Reveal>
        </header>

        <main className="blog-wrap" style={{ paddingBottom: "80px" }}>
          <DiscountBanner />
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--ink-soft)" }}>
              המדריכים בדרך. נתראה כאן ממש בקרוב.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {posts.map((post, i) => (
                <Reveal delay={i * 60} key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="blog-card post-card">
                    <p className="date">{formatDate(post.frontmatter.date)}</p>
                    <h2>{post.frontmatter.title}</h2>
                    <p>{post.frontmatter.description}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </main>
      </BlogShell>

      <WhatsappFab />
    </>
  );
}
