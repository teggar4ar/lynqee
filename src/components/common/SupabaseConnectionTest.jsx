import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getSupabaseConfig, isSupabaseConfigured } from '../../services/supabase.js';
import AuthService from '../../services/AuthService.js';
import ProfileService from '../../services/ProfileService.js';

/**
 * SupabaseConnectionTest - Component to test Supabase connection and service layer
 * 
 * This component verifies:
 * - Environment variables are loaded correctly
 * - Supabase client is configured properly
 * - Service layer functions work as expected
 * - Error handling is functioning
 */
const SupabaseConnectionTest = ({ onTestComplete }) => {
  const [testResults, setTestResults] = useState({
    config: null,
    auth: null,
    profile: null,
    errors: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      setLoading(true);
      const results = {
        config: null,
        auth: null,
        profile: null,
        errors: [],
      };

      try {
        // Test 1: Configuration
        // eslint-disable-next-line no-console
        console.log('Testing Supabase configuration...');
        const config = getSupabaseConfig();
        results.config = {
          isConfigured: isSupabaseConfigured(),
          hasUrl: Boolean(config.url),
          hasKey: config.hasKey,
          url: config.url?.substring(0, 30) + '...', // Truncate for security
        };

        // Test 2: Auth Service
        // eslint-disable-next-line no-console
        console.log('Testing Auth Service...');
        try {
          const session = await AuthService.getCurrentSession();
          results.auth = {
            success: true,
            hasSession: Boolean(session),
            sessionData: session ? 'Session exists' : 'No active session',
          };
        } catch (error) {
          results.auth = {
            success: false,
            error: error.message,
          };
          results.errors.push(`Auth Service Error: ${error.message}`);
        }

        // Test 3: Profile Service
        // eslint-disable-next-line no-console
        console.log('Testing Profile Service...');
        try {
          // Test the service method directly
          const isAvailable = await ProfileService.isUsernameAvailable('test-user-123456789');
          results.profile = {
            success: true,
            usernameCheckWorks: true,
            testUsernameAvailable: isAvailable,
          };
        } catch (error) {
          results.profile = {
            success: false,
            error: error.message,
            rlsIssue: error.message.includes('406') || error.message.includes('Not Acceptable'),
          };
          results.errors.push(`Profile Service Error: ${error.message}`);
        }

      } catch (error) {
        results.errors.push(`General Error: ${error.message}`);
      }

      setTestResults(results);
      setLoading(false);

      // Notify parent component
      if (onTestComplete) {
        onTestComplete(results);
      }
    };

    runTests();
  }, [onTestComplete]);

  const runConnectionTests = async () => {
    // Re-trigger the effect by forcing a re-render
    setLoading(true);
    // The actual test logic is in the useEffect
  };

  const getTestStatus = () => {
    if (loading) return 'testing';
    if (testResults.errors.length > 0) return 'error';
    if (testResults.config?.isConfigured && testResults.auth?.success && testResults.profile?.success) {
      return 'success';
    }
    return 'partial';
  };

  const status = getTestStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          🔌 Supabase Connection Test
        </h3>
        {loading && (
          <div className="ml-3 loading-spinner"></div>
        )}
        {!loading && (
          <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status === 'success' ? '✅ All Tests Passed' :
             status === 'error' ? '❌ Tests Failed' :
             status === 'partial' ? '⚠️ Partial Success' :
             '🔄 Testing...'}
          </span>
        )}
      </div>

      {!loading && (
        <div className="space-y-4">
          {/* Configuration Test */}
          <div className="border border-gray-100 rounded p-3">
            <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
            <div className="text-sm space-y-1">
              <div className={`flex items-center ${testResults.config?.isConfigured ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{testResults.config?.isConfigured ? '✅' : '❌'}</span>
                Is Configured: {testResults.config?.isConfigured ? 'Yes' : 'No'}
              </div>
              <div className="text-gray-600">
                URL: {testResults.config?.url || 'Not found'}
              </div>
              <div className={`${testResults.config?.hasKey ? 'text-green-600' : 'text-red-600'}`}>
                API Key: {testResults.config?.hasKey ? 'Present' : 'Missing'}
              </div>
            </div>
          </div>

          {/* Auth Service Test */}
          <div className="border border-gray-100 rounded p-3">
            <h4 className="font-medium text-gray-900 mb-2">Auth Service</h4>
            <div className="text-sm space-y-1">
              {testResults.auth?.success ? (
                <div className="space-y-1">
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Service Working
                  </div>
                  <div className="text-gray-600">
                    Status: {testResults.auth.sessionData}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="flex items-center">
                    <span className="mr-2">❌</span>
                    Service Error
                  </div>
                  <div className="text-xs mt-1">
                    {testResults.auth?.error}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Service Test */}
          <div className="border border-gray-100 rounded p-3">
            <h4 className="font-medium text-gray-900 mb-2">Profile Service</h4>
            <div className="text-sm space-y-1">
              {testResults.profile?.success ? (
                <div className="space-y-1">
                  <div className="flex items-center text-green-600">
                    <span className="mr-2">✅</span>
                    Service Working
                  </div>
                  <div className="text-gray-600">
                    Username Check: {testResults.profile.usernameCheckWorks ? 'Working' : 'Failed'}
                  </div>
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="flex items-center">
                    <span className="mr-2">❌</span>
                    Service Error
                  </div>
                  <div className="text-xs mt-1">
                    {testResults.profile?.error}
                  </div>
                  {testResults.profile?.rlsIssue && (
                    <div className="text-xs mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="text-yellow-800 font-medium">⚠️ RLS Policy Issue Detected</div>
                      <div className="text-yellow-700 mt-1">
                        The profiles table has Row Level Security enabled but no policies are configured.
                        You need to create RLS policies in Supabase Dashboard.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Errors */}
          {testResults.errors.length > 0 && (
            <div className="border border-red-200 rounded p-3 bg-red-50">
              <h4 className="font-medium text-red-900 mb-2">Errors</h4>
              <div className="text-sm space-y-1">
                {testResults.errors.map((error, index) => (
                  <div key={index} className="text-red-700">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={runConnectionTests}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Re-run Tests
          </button>
        </div>
      )}
    </div>
  );
};

SupabaseConnectionTest.propTypes = {
  onTestComplete: PropTypes.func,
};

export default SupabaseConnectionTest;
