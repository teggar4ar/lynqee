/**
 * Debug Dashboard Stats - Simple test component to debug stats updates
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useUserLinks } from '../../hooks/useUserLinks.js';
import { useDashboard } from '../../contexts/DashboardContext.jsx';
import { useLinks } from '../../contexts/LinksContext.jsx';

const DebugDashboardStats = () => {
  const { user } = useAuth();
  const { data: userLinksData, isRealTimeConnected } = useUserLinks(user?.id);
  const { dashboardStats } = useDashboard();
  const { linksData } = useLinks();

  console.log('Debug Dashboard Stats:');
  console.log('  userLinksData:', userLinksData?.length || 0, 'links');
  console.log('  linksData (from LinksContext):', linksData?.length || 0, 'links');
  console.log('  dashboardStats:', dashboardStats);
  console.log('  isRealTimeConnected:', isRealTimeConnected);

  React.useEffect(() => {
    console.warn('[DebugDashboardStats] Component rendered/updated');
    console.warn('[DebugDashboardStats] Stats object:', JSON.stringify(dashboardStats));
  });

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Dashboard Stats</h3>
      <div className="text-xs text-yellow-700 space-y-1">
        <div>User Links Hook: {userLinksData?.length || 0} links</div>
        <div>Links Context: {linksData?.length || 0} links</div>
        <div>Dashboard Stats: {dashboardStats?.totalLinks || 0} links</div>
        <div>Real-time: {isRealTimeConnected ? '✅ Connected' : '❌ Disconnected'}</div>
        <div>User ID: {user?.id || 'Not available'}</div>
      </div>
    </div>
  );
};

export default DebugDashboardStats;
