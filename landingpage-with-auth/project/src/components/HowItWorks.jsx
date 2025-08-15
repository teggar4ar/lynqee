import React from 'react';
import { UserPlus, Edit3, Share2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up & Choose Template',
    description: 'Create your account in seconds and select from our beautiful, professionally designed templates that match your style.'
  },
  {
    number: '02',
    icon: Edit3,
    title: 'Customize Your Page',
    description: 'Add your links, customize colors, upload your photo, and personalize your page to reflect your unique brand.'
  },
  {
    number: '03',
    icon: Share2,
    title: 'Share Your Lynqee',
    description: 'Copy your custom Lynqee URL and share it across all your social media platforms. Start connecting with your audience!'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-mint-cream" role="region" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-bold text-forest-green mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-lg text-sage-gray max-w-3xl mx-auto leading-body">
            Creating your personalized link page has never been easier. 
            Follow these simple steps and you'll be up and running in minutes.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line - Desktop Only */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="relative h-2">
              <div className="absolute inset-0 bg-gradient-to-r from-golden-yellow via-coral-pink to-coral-red rounded-full opacity-30"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-golden-yellow rounded-full text-forest-green font-bold text-xl mb-6 relative z-10 hover:scale-110 transition-transform duration-200">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 mb-6 border border-deep-forest/5">
                    <div className="w-16 h-16 bg-forest-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon size={32} className="text-forest-green" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-forest-green mb-4 leading-heading">
                      {step.title}
                    </h3>
                    
                    <p className="text-sage-gray leading-body">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <button className="bg-golden-yellow text-forest-green font-semibold px-8 py-4 rounded-lg hover:bg-golden-yellow/80 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
            Start Building Your Page
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;