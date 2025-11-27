import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import BackgroundDecorator from '@/components/ui/background-decorator';
import Footer from '@/components/ui/Footer';
import { Hero } from './components/landing';

const Customers = React.lazy(() => import('./components/landing/Customers'));
const FeatureMatrix = React.lazy(() => import('./components/landing/InteractiveFeatureDisplay'));
const GlobalNetwork = React.lazy(() => import('./components/landing/GlobalNetwork'));
const Integrations = React.lazy(() => import('./components/landing/Integrations'));
const QuickStartGuide = React.lazy(() => import('./components/landing/QuickStartGuide'));
const Testimonials = React.lazy(() => import('./components/landing/Testimonials'));
const Pricing = React.lazy(() => import('./components/landing/Pricing'));
const FAQ = React.lazy(() => import('./components/landing/FAQ'));
const CTA = React.lazy(() => import('./components/landing/CTA'));

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handlePricingClick = () => {
    if (isAuthenticated) {
      navigate('/coming-soon');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />
      <Hero handleGetStarted={handleGetStarted} />

      <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
        <Customers />
        <FeatureMatrix />
        <GlobalNetwork />
        <Integrations />
        <QuickStartGuide />
        <Testimonials />
        <Pricing handlePricingClick={handlePricingClick} />
        <FAQ />
        <CTA handleGetStarted={handleGetStarted} />
      </Suspense>

      <Footer />
    </div>
  );
};

export default Landing;
