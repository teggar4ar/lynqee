import React from 'react';
import {
  Header,
  Hero,
  Features,
  HowItWorks,
  SocialProof,
  Footer,
} from '../components/landing_page';

const EnhancedLandingPage = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedLandingPage;
