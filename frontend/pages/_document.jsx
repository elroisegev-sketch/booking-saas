import { Html, Head, Main, NextScript } from 'next/document';
import { localBusinessSchema } from '../lib/schema';

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta name="theme-color" content="#2d0a1e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data — LocalBusiness (NailSalon). מוזרק ב-_document כדי
            שהסכמה תישאר ב-HTML גם אם עמוד הבית מרונדר בצד הלקוח. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
