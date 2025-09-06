import React, { useState } from 'react';
import { ErrorBoundary, ErrorDisplay, ErrorState, GlobalErrorBoundary } from '../../components/common/error';
import { useErrorReporting } from '../../hooks/useErrorReporting';
import { getContextualErrorMessage, getErrorType, getUserFriendlyErrorMessage, shouldRetryError } from '../../utils/errorUtils';

/**
 * ErrorTestComponent - Comprehensive Error Testing Component
 * 
 * Komponen untuk menguji semua aspek error handling dalam aplikasi:
 * - Error boundaries (ErrorBoundary & GlobalErrorBoundary)
 * - Error components (ErrorDisplay & ErrorState)
 * - Error utilities (errorUtils functions)
 * - Error hooks (useErrorReporting)
 * 
 * Usage: Tambahkan route /error-test untuk akses mudah
 */
const ErrorTestComponent = () => {
  const [displayError, setDisplayError] = useState(null);
  const [errorStateType, setErrorStateType] = useState('general');
  const [customErrorMessage, setCustomErrorMessage] = useState('');
  const [throwBoundaryError, setThrowBoundaryError] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const errorReporting = useErrorReporting({
    component: 'ErrorTestComponent',
    module: 'Testing',
    enableConsoleLogging: true
  });

  // Predefined test errors untuk berbagai skenario
  const testErrors = {
    network: new Error('Network error: Failed to fetch data from server'),
    auth: new Error('Invalid login credentials provided'),
    validation: new Error('Validation failed: Email is required'),
    duplicate: new Error('Username already exists in the database'),
    rateLimit: new Error('Too many requests. Rate limit exceeded'),
    profileNotFound: new Error('User profile not found'),
    emailVerification: new Error('Email not confirmed. Please verify your email'),
    general: new Error('An unexpected error occurred'),
    stringError: 'Simple string error message',
    objectError: { message: 'Object-based error message', status: 500 },
    nestedError: { error: { message: 'Nested error structure' } }
  };

  // Component yang sengaja throw error untuk testing boundary
  const ErrorThrowingComponent = () => {
    if (throwBoundaryError) {
      throw testErrors[errorStateType] || testErrors.general;
    }
    return <div className="p-4 bg-green-100 rounded">✅ No errors thrown</div>;
  };

  const runErrorUtilsTest = () => {
    const results = [];
    
    Object.entries(testErrors).forEach(([key, error]) => {
      const errorType = getErrorType(error);
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      const contextualMessage = getContextualErrorMessage(error, 'profile');
      const shouldRetry = shouldRetryError(error);
      
      results.push({
        testName: key,
        originalError: error,
        detectedType: errorType,
        friendlyMessage,
        contextualMessage,
        shouldRetry
      });
    });
    
    setTestResults(results);
    
    // Report test to error reporting system
    errorReporting.reportError(new Error('Error utils test completed'), {
      action: 'runErrorUtilsTest',
      testsCount: results.length
    });
  };

  const triggerErrorDisplay = (errorKey) => {
    setDisplayError(testErrors[errorKey]);
  };

  const triggerBoundaryError = (errorType) => {
    setErrorStateType(errorType);
    setThrowBoundaryError(true);
    // Reset after brief moment to allow error boundary to catch
    setTimeout(() => setThrowBoundaryError(false), 100);
  };

  const triggerCustomError = () => {
    if (customErrorMessage.trim()) {
      const customError = new Error(customErrorMessage);
      triggerErrorDisplay('custom');
      setTestResults([...testResults, {
        testName: 'custom',
        originalError: customError,
        detectedType: getErrorType(customError),
        friendlyMessage: getUserFriendlyErrorMessage(customError),
        contextualMessage: getContextualErrorMessage(customError, 'general'),
        shouldRetry: shouldRetryError(customError)
      }]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setDisplayError(null);
    setCustomErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🧪 Error Handling Test Suite
          </h1>
          <p className="text-gray-600">
            Comprehensive testing untuk semua aspek error handling dalam aplikasi
          </p>
        </div>

        {/* Error Display Testing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">1. ErrorDisplay Component Test</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {Object.keys(testErrors).map((errorKey) => (
              <button
                key={errorKey}
                onClick={() => triggerErrorDisplay(errorKey)}
                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                {errorKey}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customErrorMessage}
                onChange={(e) => setCustomErrorMessage(e.target.value)}
                placeholder="Enter custom error message..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={triggerCustomError}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Custom
              </button>
            </div>
          </div>

          {displayError && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Current Error Display:</h3>
              <ErrorDisplay 
                error={displayError} 
                showIcon={true}
                size="default"
              />
            </div>
          )}
        </div>

        {/* Error State Testing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">2. ErrorState Component Test</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {['general', 'network', 'auth', 'validation', 'duplicate', 'rateLimit', 'profileNotFound', 'unauthorized'].map((type) => (
              <button
                key={type}
                onClick={() => setErrorStateType(type)}
                className={`px-3 py-2 rounded text-sm ${
                  errorStateType === type 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Current ErrorState ({errorStateType}):</h3>
            <div className="bg-white rounded border">
              <ErrorState 
                type={errorStateType}
                error={testErrors[errorStateType]}
                onRetry={() => alert(`Retry clicked for ${errorStateType}`)}
                className="py-8"
              />
            </div>
          </div>
        </div>

        {/* Error Boundary Testing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">3. Error Boundary Test</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {Object.keys(testErrors).slice(0, 8).map((errorKey) => (
              <button
                key={errorKey}
                onClick={() => triggerBoundaryError(errorKey)}
                className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                Throw {errorKey}
              </button>
            ))}
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Error Boundary Test Area:</h3>
            <ErrorBoundary 
              maxRetries={3}
              onError={(errorContext) => {
                console.warn('ErrorBoundary caught:', errorContext);
              }}
              onRetry={(error, retryCount) => {
                console.warn(`Retry attempt ${retryCount} for:`, error.message);
              }}
              fallback={<ErrorState type={errorStateType} />}
            >
              <ErrorThrowingComponent />
            </ErrorBoundary>
          </div>
        </div>

        {/* Error Utils Testing */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">4. Error Utils Test</h2>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={runErrorUtilsTest}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Run Error Utils Test
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Test</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Original Error</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Detected Type</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Friendly Message</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Should Retry</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 font-medium">
                        {result.testName}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 max-w-xs truncate">
                        {typeof result.originalError === 'string' 
                          ? result.originalError 
                          : result.originalError.message || JSON.stringify(result.originalError)
                        }
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.detectedType === 'network' ? 'bg-red-100 text-red-800' :
                          result.detectedType === 'auth' ? 'bg-yellow-100 text-yellow-800' :
                          result.detectedType === 'validation' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.detectedType}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 max-w-sm">
                        {result.friendlyMessage}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.shouldRetry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {result.shouldRetry ? 'Yes' : 'No'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">5. Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <button
              onClick={() => {
                // Test error reporting
                errorReporting.reportError(new Error('Manual test error'), {
                  action: 'manual_test',
                  timestamp: new Date().toISOString()
                });
                alert('Error reported! Check console for details.');
              }}
              className="px-4 py-3 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              🔍 Test Error Reporting
            </button>

            <button
              onClick={() => {
                // Test network error with retry
                const networkError = new Error('Failed to fetch');
                setDisplayError(networkError);
                console.warn('Network error test:', {
                  type: getErrorType(networkError),
                  shouldRetry: shouldRetryError(networkError),
                  message: getUserFriendlyErrorMessage(networkError)
                });
              }}
              className="px-4 py-3 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              🌐 Test Network Error
            </button>

            <button
              onClick={() => {
                // Test contextual messages
                const errors = ['auth', 'validation', 'duplicate'];
                const contexts = ['link', 'profile', 'auth'];
                
                errors.forEach(errorType => {
                  contexts.forEach(context => {
                    const testError = testErrors[errorType];
                    const contextualMsg = getContextualErrorMessage(testError, context);
                    console.warn(`${errorType} in ${context}:`, contextualMsg);
                  });
                });
                alert('Contextual messages test completed! Check console.');
              }}
              className="px-4 py-3 bg-teal-500 text-white rounded hover:bg-teal-600"
            >
              📝 Test Contextual Messages
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔧 Testing Instructions</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• <strong>ErrorDisplay:</strong> Klik tombol error types untuk melihat inline error messages</li>
            <li>• <strong>ErrorState:</strong> Pilih error type untuk melihat full-page error states</li>
            <li>• <strong>Error Boundary:</strong> Klik "Throw" buttons untuk test error boundary catching</li>
            <li>• <strong>Error Utils:</strong> Klik "Run Error Utils Test" untuk test semua utility functions</li>
            <li>• <strong>Console:</strong> Buka browser console untuk melihat detailed error logs</li>
            <li>• <strong>Custom Errors:</strong> Input custom error message untuk test edge cases</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ErrorTestComponent;
