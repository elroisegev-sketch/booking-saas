import Head from 'next/head';
import '../styles/globals.css'
import CookieBanner from '../components/CookieBanner';
import { site } from '../lib/site';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>לק ג'ל ומניקור בגבעת שמואל | ליאור שגב</title>
        <meta name="description" content={site.description} />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content={site.legalName} />
      </Head>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}
