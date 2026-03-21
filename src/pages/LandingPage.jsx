import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import StatsSection from '../components/landing/StatsSection';
import Footer from '../components/landing/Footer';
import { useTheme } from 'styled-components';

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#080d1a' : theme.colors.background,
      overflowX: 'hidden'
    }}>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <Footer />
    </div>
  );
}