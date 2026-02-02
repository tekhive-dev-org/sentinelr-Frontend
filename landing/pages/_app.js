import '@/styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  const siteUrl = 'https://sentinelr.com'; // Update with your actual domain
  const siteName = 'Sentinelr';
  const siteTitle = 'Sentinelr - Personal Safety & Security App';
  const siteDescription = 'Take control of your safety. Sentinelr helps you protect yourself, your loved ones, and your devices with real-time location sharing, emergency alerts, and smart security features.';
  const siteImage = `${siteUrl}/logo.png`;

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{siteTitle}</title>
        <meta name="title" content={siteTitle} />
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content="personal safety, security app, location sharing, emergency alerts, family safety, device tracking, safety app, protection app, security, Sentinelr" />
        <meta name="author" content="TechHive" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={siteImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={siteImage} />
        
        {/* Additional SEO */}
        <meta name="theme-color" content="#e07030" />
        <meta name="msapplication-TileColor" content="#e07030" />
        <link rel="canonical" href={siteUrl} />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
