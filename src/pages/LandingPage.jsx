import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsSection from '../components/landing/StatsSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080d1a', overflowX: 'hidden' }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </div>
  );
}