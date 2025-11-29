import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BackgroundDecorator from '@/components/ui/background-decorator';
import Footer from '@/components/ui/Footer';
import { Hero } from './components/landing';

// Direct Import (Fast render below the fold)
import Customers from './components/landing/Customers';
import GlobalNetwork from './components/landing/GlobalNetwork';
import Pricing from './components/landing/Pricing';
import CTA from './components/landing/CTA';

// Heavy Sections (Delayed)
import FeatureMatrix from './components/landing/InteractiveFeatureDisplay';
import Integrations from './components/landing/Integrations';
import QuickStartGuide from './components/landing/QuickStartGuide';
import Testimonials from './components/landing/Testimonials';
import FAQ from './components/landing/FAQ';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load heavy sections AFTER first view
  const [loadHeavy, setLoadHeavy] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadHeavy(true);   // Load heavy UI after 1 second
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleGetStarted = () => {
    navigate(isAuthenticated ? '/dashboard' : '/signup');
  };

  const handlePricingClick = () => {
    navigate(isAuthenticated ? '/coming-soon' : '/signup');
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />

      {/* ✅ FAST FIRST VIEW */}
      <Hero handleGetStarted={handleGetStarted} />

      {/* ✅ LIGHT COMPONENTS (LOAD IMMEDIATE BELOW HERO) */}
      <Customers />
      <GlobalNetwork />
      
      {/* ✅ HEAVY PARTS (LOAD AFTER FIRST PAINT) */}
      {loadHeavy && (
        <>
          <FeatureMatrix />
          <Integrations />
          <QuickStartGuide />
          <Testimonials />
          <Pricing handlePricingClick={handlePricingClick} />
          <FAQ />
          <CTA handleGetStarted={handleGetStarted} />
        </>
      )}

      <Footer />
    </div>
  );
};

export default Landing;
