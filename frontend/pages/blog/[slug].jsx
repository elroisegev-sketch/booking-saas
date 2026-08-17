import Head from "next/head";
import Link from "next/link";
import { marked } from "marked";
import { getPostBySlug, getPostSlugs } from "../../lib/posts";
import { site } from "../../lib/site";
import { articleSchema } from "../../lib/schema";
import JsonLd from "../../components/blog/JsonLd";
import Faq from "../../components/blog/Faq";
import PriceTable from "../../components/blog/PriceTable";
import BlogShell from "../../components/blog/BlogShell";
import Reveal from "../../components/blog/Reveal";
import AboutLior from "../../components/blog/AboutLior";
import DiscountBanner from "../../components/blog/DiscountBanner";
import Gallery from "../../components/blog/Gallery";
import { WhatsappButton, WhatsappFab } from "../../components/blog/WhatsappButton";
import { ArrowIcon } from "../../components/blog/icons";

export async function getStaticPaths() {
  return {
    paths: getPostSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { notFound: true };
  // ממירים Markdown ל-HTML בזמן build (ללא הרצת קוד בצד הלקוח — תואם ל-CSP של האתר)
  const html = marked.parse(post.content, { mangle: false, headerIds: false });
  return {
    props: { slug: post.slug, frontmatter: post.frontmatter, html },
  };
}

function formatDate(d) {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(d));
  } catch {
    return d;
  }
}

export default function BlogPost({ slug, frontmatter, html }) {
  const canonical = `${site.url}/blog/${slug}`;
  return (
    <>
      <Head>
        <title>{frontmatter.title}</title>
        <meta name="description" content={frontmatter.description} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="he-IL" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:title" content={frontmatter.title} />
        <meta property="og:description" content={frontmatter.description} />
        <meta property="og:url" content={canonical} />
      </Head>

      <BlogShell>
        <article className="blog-wrap" style={{ paddingBlock: "40px 64px" }}>
          <Reveal>
            <Link href="/blog" className="back-link" style={{ marginBottom: "1.5rem" }}>
              <ArrowIcon />
              כל המדריכים
            </Link>
          </Reveal>

          <Reveal delay={40}>
            <h1 className="blog-title">{frontmatter.title}</h1>
            <p className="blog-byline">
              מאת ליאור שגב · עודכן {formatDate(frontmatter.updated || frontmatter.date)}
            </p>
          </Reveal>

          {/* היכרות עם תמונה */}
          <AboutLior />

          {/* באנר הנחה — בין ההיכרות למחירון */}
          <DiscountBanner />

          <Reveal delay={80} className="blog-prose">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </Reveal>

          {frontmatter.prices && frontmatter.prices.length > 0 && (
            <PriceTable items={frontmatter.prices} />
          )}

          {/* גלריית עבודות — אחרי המחירון */}
          <Gallery />

          {frontmatter.faq && frontmatter.faq.length > 0 && <Faq items={frontmatter.faq} />}

          <Reveal className="blog-card cta-card" style={{ marginTop: "3rem" }}>
            <h2>{frontmatter.ctaTitle || "מוכנה לקבוע תור?"}</h2>
            <p>{frontmatter.ctaText || "כתבי לי הודעה קצרה בוואטסאפ ונמצא יחד תור שמתאים לך."}</p>
            <WhatsappButton
              block
              message={`היי ליאור, קראתי את "${frontmatter.title}" ואשמח לקבוע תור`}
            />
          </Reveal>
        </article>
      </BlogShell>

      <JsonLd
        data={articleSchema({
          title: frontmatter.title,
          description: frontmatter.description,
          slug,
          date: frontmatter.date,
          updated: frontmatter.updated,
          image: frontmatter.cover,
        })}
      />
      <WhatsappFab />
    </>
  );
}
