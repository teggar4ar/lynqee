import React from 'react';
import { Star, Quote, TrendingUp, Users, Link as LinkIcon } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    title: 'Content Creator',
    content: 'Lynqee transformed how I connect with my audience. The analytics feature helps me understand what content resonates most with my followers.',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    title: 'Small Business Owner',
    content: 'Setting up my business links was incredibly easy. The customization options let me match my brand perfectly, and the mobile experience is flawless.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    title: 'Digital Marketer',
    content: 'The best link-in-bio solution I\'ve used. Clean interface, powerful features, and the customer support is outstanding. Highly recommended!',
    rating: 5
  }
];

const stats = [
  { icon: Users, value: '50,000+', label: 'Active Users' },
  { icon: LinkIcon, value: '2M+', label: 'Links Created' },
  { icon: TrendingUp, value: '25M+', label: 'Monthly Clicks' }
];

const SocialProof = () => {
  return (
    <section className="py-16 md:py-24 bg-white" role="region" aria-labelledby="social-proof-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 id="social-proof-heading" className="text-3xl md:text-4xl font-bold text-forest-green mb-12">
            Trusted by Creators Worldwide
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-golden-yellow" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-forest-green mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sage-gray font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-mint-cream rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-deep-forest/5"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 bg-coral-pink/20 rounded-full flex items-center justify-center mb-4">
                <Quote size={20} className="text-coral-pink" />
              </div>

              {/* Stars */}
              <div className="flex space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-golden-yellow fill-golden-yellow"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-sage-gray leading-body mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-golden-yellow to-coral-pink rounded-full flex items-center justify-center mr-4">
                  <span className="text-forest-green font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-forest-green">
                    {testimonial.name}
                  </div>
                  <div className="text-sage-gray text-sm">
                    {testimonial.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
