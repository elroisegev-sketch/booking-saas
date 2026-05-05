import '../styles/globals.css'
import CookieBanner from '../components/CookieBanner';
export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
    </>
  );
}
