import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="he" dir="rtl">
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta name="theme-color" content="#2d0a1e" />
        <meta name="description" content="ליאור שגב – היופי שלך | קביעת תורים" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
