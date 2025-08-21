import React from 'react';
import { ArrowRight, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="home" className="bg-mint-cream py-16 md:py-24 overflow-hidden" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-forest-green leading-heading mb-6">
              One Link,{' '}
              <span className="text-golden-yellow">Infinite</span>{' '}
              Possibilities
            </h1>

            <p className="text-lg md:text-xl text-sage-gray leading-body mb-8 max-w-2xl mx-auto lg:mx-0">
              Transform your social media presence with Lynqee. Create a stunning,
              personalized landing page that showcases all your content, links, and
              connections in one beautiful place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/login" className="bg-golden-yellow text-forest-green font-semibold px-8 py-4 rounded-lg hover:bg-golden-yellow/80 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group">
                Get Started Free
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <button className="border-2 border-forest-green text-forest-green font-semibold px-8 py-4 rounded-lg hover:bg-forest-green hover:text-mint-cream transition-all duration-200">
                View Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start space-x-8">
              <div className="flex items-center space-x-2">
                <Users className="text-forest-green" size={20} />
                <span className="text-sage-gray font-medium">50K+ Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-golden-yellow fill-golden-yellow" size={20} />
                <span className="text-sage-gray font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative">
            <div className="bg-gradient-to-br from-coral-pink/20 to-coral-red/20 rounded-3xl p-8 transform rotate-3 hover:rotate-1 transition-transform duration-300">
              <div className="bg-mint-cream rounded-2xl p-6 shadow-xl border-2 border-deep-forest/10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-golden-yellow rounded-full flex items-center justify-center">
                      <span className="text-forest-green font-bold text-lg">L</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-green">@yourhandle</h3>
                      <p className="text-sage-gray text-sm">Content Creator</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-golden-yellow/20 border border-golden-yellow/30 rounded-lg p-3 hover:bg-golden-yellow/30 transition-colors cursor-pointer">
                      <span className="text-forest-green font-medium">🎥 Latest YouTube Video</span>
                    </div>
                    <div className="bg-coral-pink/20 border border-coral-pink/30 rounded-lg p-3 hover:bg-coral-pink/30 transition-colors cursor-pointer">
                      <span className="text-forest-green font-medium">📸 Instagram Profile</span>
                    </div>
                    <div className="bg-coral-red/20 border border-coral-red/30 rounded-lg p-3 hover:bg-coral-red/30 transition-colors cursor-pointer">
                      <span className="text-forest-green font-medium">🛍️ Online Store</span>
                    </div>
                    <div className="bg-forest-green/10 border border-forest-green/20 rounded-lg p-3 hover:bg-forest-green/20 transition-colors cursor-pointer">
                      <span className="text-forest-green font-medium">📧 Contact Me</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
