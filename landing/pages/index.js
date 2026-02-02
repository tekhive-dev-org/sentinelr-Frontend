import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import About from '@/components/About';
import AppPreview from '@/components/AppPreview';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

// Dynamically import BeeCanvas with SSR disabled (it uses window/document)
const BeeCanvas = dynamic(() => import('@/components/BeeCanvas'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      {/* Bee Background Canvas */}
      {/* <BeeCanvas /> */}

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* About Section */}
      <About />

      {/* App Preview Section */}
      <AppPreview />

      {/* Contact Section */}
      <Contact />

      {/* Footer */}
      <Footer />
    </>
  );
}
