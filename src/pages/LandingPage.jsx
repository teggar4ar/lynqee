import React from 'react';
import {
  Features,
  Footer,
  Header,
  Hero,
  HowItWorks,
  SocialProof,
} from '../components/landing_page';

const LandingPage = () => {
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

export default LandingPage;
