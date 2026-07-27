import Head from 'next/head';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import About from '../components/landing/About';
import AppPreview from '../components/landing/AppPreview';
import GetAppSection from '../components/landing/GetAppSection';
import AccessCTA from '../components/landing/AccessCTA';
import Footer from '../components/landing/Footer';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Sentinelr',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Web, Android, iOS',
  description:
    'Family safety platform for location sharing, emergency alerts, device management, and parental controls.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'TechHive',
    url: 'https://techhives.dev',
  },
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Sentinelr | Connected Family Safety</title>
        <meta
          name="description"
          content="Protect your family with live location visibility, emergency alerts, device management, and connected safety controls from Sentinelr."
        />
        <meta property="og:title" content="Sentinelr | Connected Family Safety" />
        <meta
          property="og:description"
          content="Live location visibility, emergency alerts, and connected safety controls for the people who matter most."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/landing/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-[#f6f4f9] text-deep-forest">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <About />
          <AppPreview />
          <GetAppSection />
          <AccessCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
