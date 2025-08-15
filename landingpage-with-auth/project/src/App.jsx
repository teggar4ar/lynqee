import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import AuthContainer from './components/auth/AuthContainer';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  if (showAuth) {
    return <AuthContainer />;
  }

  return (
    <div className="min-h-screen bg-mint-cream">
      <Header onShowAuth={() => setShowAuth(true)} />
      <main role="main">
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
      </main>
      <Footer />
    </div>
  );
}

export default App;