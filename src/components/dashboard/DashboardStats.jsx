/**
 * DashboardStats - Mobile-first stats display component
 * 
 * Features:
 * - Mobile-optimized grid layout
 * - Touch-friendly stat cards
 * - Responsive design
 * - Future-ready for analytics
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Eye, Info, Link, MousePointer } from 'lucide-react';
import { useAlerts } from '../../hooks';

const DashboardStats = ({ 
  stats = {},
  loading = false,
  className = '',
  
}) => {
  const { showInfo } = useAlerts();
  
  const defaultStats = {
    totalLinks: 0,
    totalClicks: 0,
    profileViews: 0,
    ...stats
  };

  // Handle click on unavailable features
  const handleUnavailableFeatureClick = (featureName) => {
    showInfo({
      title: 'Feature Coming Soon',
      message: `${featureName} analytics will be available in an upcoming update. Stay tuned!`,
      duration: 4000,
      position: 'bottom-center'
    });
  };

  const statItems = [
    {
      id: 'links',
      label: 'Links',
      value: defaultStats.totalLinks,
      icon: (
        <Link className="w-6 h-6 text-golden-yellow" />
      ),
      available: true
    },
    {
      id: 'clicks',
      label: 'Total Clicks',
      value: defaultStats.totalClicks,
      icon: (
        <MousePointer className="w-6 h-6 text-green-600" />
      ),
      available: false // Future feature
    },
    {
      id: 'views',
      label: 'Profile Views',
      value: defaultStats.profileViews,
      icon: (
        <Eye className="w-6 h-6 text-purple-600" />
      ),
      available: false // Future feature
    }
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 md:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-lg font-semibold text-gray-900 md:text-xl">
          Quick Stats
        </h2>
      </div>
      
      {/* Mobile: Horizontal 3-column layout, Desktop: Keep same layout */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {statItems.map((item) => (
          <div
            key={item.id}
            onClick={!item.available ? () => handleUnavailableFeatureClick(item.label) : undefined}
            className={`
              relative p-3 md:p-4 rounded-lg border-2 transition-all duration-200
              ${item.available 
                ? 'bg-white border-gray-200 hover:border-golden-yellow hover:shadow-sm' 
                : 'bg-gray-50 border-gray-100 cursor-pointer hover:bg-gray-100'
              }
            `}
          >
            {/* Mobile: Compact vertical layout, Desktop: Keep existing layout */}
            <div className="flex flex-col items-center">
              {/* Icon - smaller on mobile, properly centered */}
              <div className={`
                w-8 h-8 md:w-10 md:h-10 rounded-lg mb-2 
                flex items-center justify-center
                ${item.available ? 'bg-golden-yellow/10' : 'bg-gray-100'}
              `}>
                {React.cloneElement(item.icon, {
                  className: `w-4 h-4 md:w-6 md:h-6 ${item.icon.props.className.replace('w-6 h-6', 'w-4 h-4 md:w-6 md:h-6')}`
                })}
              </div>
              
              {/* Status badge - only show on desktop */}
              {!item.available && (
                <div className="hidden md:block absolute top-2 right-2">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    Soon
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center space-y-1">
              {/* Value - more compact on mobile */}
              <p className={`
                text-xl md:text-2xl font-bold
                ${item.available ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {item.value}
              </p>
              {/* Label - shorter on mobile */}
              <p className={`
                text-xs md:text-sm
                ${item.available ? 'text-gray-600' : 'text-gray-400'}
              `}>
                {item.id === 'clicks' ? 'Clicks' : item.label}
              </p>
            </div>
            
            {/* Mobile: Simple "Soon" indicator */}
            {!item.available && (
              <div className="md:hidden">
                <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mt-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Coming soon message for unavailable features - more compact on mobile */}
      <div className="mt-3 md:mt-4 p-3 bg-mint-cream rounded-lg border border-golden-yellow/30">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 md:w-5 md:h-5 text-golden-yellow mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-xs md:text-sm font-medium text-forest-green">
              Analytics Coming Soon
            </h3>
            <p className="text-xs text-sage-gray mt-1 hidden md:block">
              Click tracking and profile view analytics will be available in upcoming updates.
            </p>
            <p className="text-xs text-sage-gray mt-1 md:hidden">
              Analytics features coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    totalLinks: PropTypes.number,
    totalClicks: PropTypes.number,
    profileViews: PropTypes.number,
  }),
  loading: PropTypes.bool,
  className: PropTypes.string,
  showRealTimeIndicator: PropTypes.bool,
};

export default DashboardStats;
