/**
 * Enhanced Real-time Connection Hook
 * 
 * Provides sophisticated real-time connection management using the ConnectionManager
 * for any Supabase real-time subscription. This replaces the basic reconnection
 * logic with intelligent, mobile-optimized connection handling.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase.js';
import { CONNECTION_QUALITY, CONNECTION_STATE, ConnectionManager } from '../utils/connectionManager.js';
import { useAlerts } from './useAlerts.js';
import { getErrorType, getUserFriendlyErrorMessage } from '../utils/errorUtils.js';

/**
 * Enhanced real-time subscription hook with sophisticated connection management
 */
export const useEnhancedRealtime = ({
  channelName,
  subscriptionConfig,
  onPayload,
  enabled = true,
  _userId = null
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState(CONNECTION_QUALITY.UNKNOWN);
  const [reconnectInfo, setReconnectInfo] = useState(null);
  
  const subscriptionRef = useRef(null);
  const connectionManagerRef = useRef(null);
  const wasDisconnected = useRef(false);
  const connectionStartTime = useRef(null);
  
  // Stable reference for the payload handler to prevent subscription recreation
  const onPayloadRef = useRef(onPayload);
  
  // Update the reference when onPayload changes, but don't recreate subscription
  useEffect(() => {
    onPayloadRef.current = onPayload;
  }, [onPayload]);
  
  const { showSuccess, showInfo, showWarning } = useAlerts();

  // Initialize connection manager
  useEffect(() => {
    if (!connectionManagerRef.current) {
      connectionManagerRef.current = new ConnectionManager({
        maxReconnectAttempts: 15, // More attempts for mobile users
        baseDelay: 1000,
        maxDelay: 45000,          // Longer max delay for poor connections
        qualityCheckInterval: 20000,
        connectionTimeout: 15000,  // Longer timeout for mobile
        heartbeatInterval: 30000   // Less frequent heartbeat to save battery
      });
    }
    
    return () => {
      if (connectionManagerRef.current) {
        connectionManagerRef.current.destroy();
        connectionManagerRef.current = null;
      }
    };
  }, []);

  // Helper to get connection error details
  const getConnectionError = useCallback((status, error) => {
    const errorType = getErrorType(error || `realtime ${status}`);
    return {
      type: errorType,
      message: getUserFriendlyErrorMessage(error || `Connection ${status}`),
      status,
      timestamp: Date.now()
    };
  }, []);

  // Update connection quality based on manager state
  const updateConnectionQuality = useCallback(() => {
    if (connectionManagerRef.current) {
      const stats = connectionManagerRef.current.getStatistics();
      setConnectionQuality(stats.quality);
      
      // Show quality degradation warnings on mobile
      if (stats.environment.isMobile && stats.quality === CONNECTION_QUALITY.POOR) {
        showWarning({
          title: 'Connection Quality Poor',
          message: 'Updates may be delayed. Consider switching to a stronger network.',
          duration: 4000,
          position: 'top-center'
        });
      }
    }
  }, [showWarning]);

  // Stable references for functions to prevent subscription recreation
  const updateConnectionQualityRef = useRef();
  const getConnectionErrorRef = useRef();
  const showSuccessRef = useRef();
  const showInfoRef = useRef();
  const setupSubscriptionRef = useRef();
  
  // Update refs when functions change
  useEffect(() => {
    updateConnectionQualityRef.current = updateConnectionQuality;
    getConnectionErrorRef.current = getConnectionError;
    showSuccessRef.current = showSuccess;
    showInfoRef.current = showInfo;
  }, [updateConnectionQuality, getConnectionError, showSuccess, showInfo]);

  // Setup real-time subscription with enhanced connection management
  const setupSubscription = useCallback(() => {
    if (!enabled || !channelName || subscriptionRef.current) {
      return;
    }

    console.warn(`[useEnhancedRealtime] Setting up subscription: ${channelName}`);
    connectionStartTime.current = Date.now();
    
    // Create subscription
    let subscription = supabase.channel(channelName);
    
    // Add postgres changes listener if provided
    if (subscriptionConfig) {
      subscription = subscription.on(
        'postgres_changes',
        subscriptionConfig,
        (payload) => {
          // Use the stable reference to call the current onPayload
          if (onPayloadRef.current) {
            onPayloadRef.current(payload);
          }
        }
      );
    }
    
    // Subscribe with status monitoring
    subscription.subscribe((status, error) => {
      console.warn(`[useEnhancedRealtime] ${channelName} status: ${status}`, error);
      
      const connectionManager = connectionManagerRef.current;
      if (!connectionManager) return;

      switch (status) {
        case 'SUBSCRIBED': {
          const responseTime = connectionStartTime.current ? 
            Date.now() - connectionStartTime.current : null;
          
          // Record successful connection
          connectionManager.onConnectionSuccess(responseTime);
          
          setIsConnected(true);
          setConnectionError(null);
          setReconnectInfo(null);
          
          // Update quality assessment
          if (updateConnectionQualityRef.current) {
            updateConnectionQualityRef.current();
          }
          
          // Show success notification if recovering from disconnection
          if (wasDisconnected.current && showSuccessRef.current) {
            const stats = connectionManager.getStatistics();
            const qualityText = stats.quality === CONNECTION_QUALITY.EXCELLENT ? 'Excellent' :
                               stats.quality === CONNECTION_QUALITY.GOOD ? 'Good' :
                               stats.quality === CONNECTION_QUALITY.FAIR ? 'Fair' :
                               stats.quality === CONNECTION_QUALITY.POOR ? 'Poor' : 'Unknown';
            
            showSuccessRef.current({
              title: 'Connection Restored',
              message: `Real-time updates resumed (Quality: ${qualityText})`,
              duration: 3000,
              position: 'top-center'
            });
            wasDisconnected.current = false;
          }
          break;
        }
          
        case 'CHANNEL_ERROR':
        case 'SUBSCRIPTION_ERROR':
        case 'TIMED_OUT':
        case 'CLOSED': {
          // Record connection failure
          connectionManager.onConnectionFailure(error);
          
          setIsConnected(false);
          setConnectionError(getConnectionErrorRef.current ? getConnectionErrorRef.current(status, error) : null);
          wasDisconnected.current = true;
          
          // Update quality assessment
          if (updateConnectionQualityRef.current) {
            updateConnectionQualityRef.current();
          }
          
          // Schedule reconnection using enhanced manager
          const reconnectResult = connectionManager.scheduleReconnection(() => {
            // Clean up current subscription before reconnecting
            if (subscriptionRef.current) {
              supabase.removeChannel(subscriptionRef.current);
              subscriptionRef.current = null;
            }
            setupSubscriptionRef.current();
          });
          
          if (reconnectResult) {
            setReconnectInfo(reconnectResult);
            
            // Show user-friendly reconnection message
            const stats = connectionManager.getStatistics();
            if (stats.environment.isMobile && stats.environment.isBackground) {
              if (showInfoRef.current) {
                showInfoRef.current({
                  title: 'Background Reconnection',
                  message: 'Reconnecting when app returns to foreground',
                  duration: 2000,
                  position: 'top-center'
                });
              }
            } else {
              if (showInfoRef.current) {
                showInfoRef.current({
                  title: 'Reconnecting...',
                  message: `Attempting to restore connection (${reconnectResult.attemptNumber}/${connectionManager.config.maxReconnectAttempts})`,
                  duration: Math.min(reconnectResult.delay, 3000),
                  position: 'top-center'
                });
              }
            }
          }
          break;
        }
          
        default:
          console.warn(`[useEnhancedRealtime] Unknown status: ${status}`);
          break;
      }
    });

    subscriptionRef.current = subscription;
  }, [enabled, channelName, subscriptionConfig]); // Minimal dependencies, using stable refs for functions

  // Update setupSubscription ref
  useEffect(() => {
    setupSubscriptionRef.current = setupSubscription;
  }, [setupSubscription]);

  // Cancel reconnection attempts
  const cancelReconnection = useCallback(() => {
    if (connectionManagerRef.current) {
      connectionManagerRef.current.cancelReconnection();
      setReconnectInfo(null);
    }
  }, []);

  // Manual reconnection
  const forceReconnect = useCallback(() => {
    if (connectionManagerRef.current) {
      // Reset attempt count for immediate retry
      connectionManagerRef.current.attemptCount = 0;
      connectionManagerRef.current.resume();
    }
    
    // Clean up current subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    // Immediate reconnection
    if (setupSubscriptionRef.current) {
      setupSubscriptionRef.current();
    }
  }, []);

  // Setup subscription effect
  useEffect(() => {
    if (enabled && channelName && setupSubscriptionRef.current) {
      setupSubscriptionRef.current();
    }
    
    return () => {
      // Cancel any pending reconnections
      if (connectionManagerRef.current) {
        connectionManagerRef.current.cancelReconnection();
      }
      
      // Clean up subscription
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      
      // Reset state
      setIsConnected(false);
      setConnectionError(null);
      setReconnectInfo(null);
      wasDisconnected.current = false;
    };
  }, [enabled, channelName]); // Removed setupSubscription dependency

  // Get current connection statistics
  const getConnectionStats = useCallback(() => {
    if (connectionManagerRef.current) {
      return connectionManagerRef.current.getStatistics();
    }
    return null;
  }, []);

  return {
    isConnected,
    connectionError,
    connectionQuality,
    reconnectInfo,
    forceReconnect,
    cancelReconnection,
    getConnectionStats
  };
};
