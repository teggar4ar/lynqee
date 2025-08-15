import React from 'react';
import { Link, BarChart3, Palette, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Link,
    title: 'Custom Link Pages',
    description: 'Create beautiful, personalized pages that reflect your brand and style with unlimited customization options.',
    color: 'golden-yellow'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track clicks, views, and engagement with detailed analytics to understand your audience better.',
    color: 'coral-pink'
  },
  {
    icon: Palette,
    title: 'Easy Customization',
    description: 'Choose from stunning themes, colors, and layouts. No coding required - just point, click, and customize.',
    color: 'coral-red'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Your link page looks perfect on every device. Responsive design ensures great user experience everywhere.',
    color: 'forest-green'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white" role="region" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-forest-green mb-4">
            Why Choose Lynqee?
          </h2>
          <p className="text-lg text-sage-gray max-w-3xl mx-auto leading-body">
            Discover the powerful features that make Lynqee the perfect platform 
            for creators, businesses, and individuals to showcase their digital presence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-mint-cream rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border border-deep-forest/5 group"
              >
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon 
                    size={24} 
                    className={`text-${feature.color === 'forest-green' ? 'forest-green' : feature.color === 'golden-yellow' ? 'golden-yellow' : feature.color === 'coral-pink' ? 'coral-pink' : 'coral-red'}`} 
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-forest-green mb-3 leading-heading">
                  {feature.title}
                </h3>
                
                <p className="text-sage-gray leading-body">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;