import React, { useState } from 'react';
import {
  Header,
  Hero,
  Features,
  HowItWorks,
  SocialProof,
  Footer,
} from '../components/landing_page';
import { AuthContainer } from '../components/auth';
import Modal from '../components/common/Modal';

const EnhancedLandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleShowAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="bg-white">
      <Header onShowAuth={handleShowAuth} />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
      </main>
      <Footer />

      <Modal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        size="full"
        showCloseButton={true}
        className="bg-mint-cream max-w-6xl"
      >
        <AuthContainer />
      </Modal>
    </div>
  );
};

export default EnhancedLandingPage;
