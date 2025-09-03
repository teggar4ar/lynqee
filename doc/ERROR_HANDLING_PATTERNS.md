# Error Handling Patterns Documentation

## Overview

This document outlines the standardized error handling patterns implemented in the Lynqee application. These patterns ensure consistent error management, better user experience, and improved debugging capabilities.

## Table of Contents

1. [Error Handling Architecture](#error-handling-architecture)
2. [Error Components](#error-components)
3. [Error Utilities](#error-utilities)
4. [Custom Hooks](#custom-hooks)
5. [Implementation Patterns](#implementation-patterns)
6. [Testing Guidelines](#testing-guidelines)
7. [Best Practices](#best-practices)

---

## Error Handling Architecture

### Component Hierarchy

```
GlobalErrorBoundary (App-level)
├── ErrorBoundary (Route-level)
│   ├── ErrorBoundary (Component-level)
│   │   └── Components with ErrorDisplay
│   └── Components with ErrorState
└── Service Layer Error Reporting
```

### Error Flow

1. **Error Occurs** → Component/Hook/Service
2. **Error Processing** → errorUtils.js functions
3. **Error Display** → ErrorDisplay/ErrorState components
4. **Error Reporting** → useErrorReporting hook
5. **Error Recovery** → useRetry/useAsync hooks

---

## Error Components

### 1. GlobalErrorBoundary

**Purpose**: Catches unhandled errors at the application level to prevent blank screens.

**Usage**:
```jsx
import { GlobalErrorBoundary } from './components/common/error';

function App() {
  return (
    <GlobalErrorBoundary onError={(error, errorInfo) => {
      console.error('Global error:', error);
      // Optional: Send to error reporting service
    }}>
      <YourApp />
    </GlobalErrorBoundary>
  );
}
```

**Features**:
- Prevents application crashes
- Provides fallback UI
- Supports error reporting integration
- Development vs production error display

### 2. ErrorBoundary

**Purpose**: Catches errors within specific component trees for better isolation.

**Usage**:
```jsx
import { ErrorBoundary, ErrorState } from './components/common/error';

<ErrorBoundary fallback={<ErrorState type="general" />}>
  <YourComponent />
</ErrorBoundary>
```

**Props**:
- `fallback`: React element to display on error
- `onError`: Callback function when error occurs
- `children`: Components to wrap

### 3. ErrorState

**Purpose**: Full-page error states for different error scenarios.

**Usage**:
```jsx
import { ErrorState } from './components/common/error';

<ErrorState 
  type="network"
  title="Connection Problem"
  message="Unable to connect to the server"
  actionLabel="Try Again"
  onAction={handleRetry}
  secondaryActionLabel="Go Back"
  onSecondaryAction={handleGoBack}
/>
```

**Error Types**:
- `general`: Generic error state
- `network`: Network connectivity issues
- `unauthorized`: Authentication/permission errors
- `profileNotFound`: Profile not found (404)
- `rateLimit`: Rate limiting errors
- `maintenance`: Maintenance mode

### 4. ErrorDisplay

**Purpose**: Inline error messages within forms and components.

**Usage**:
```jsx
import { ErrorDisplay } from './components/common/error';

<ErrorDisplay 
  error={error}
  size="medium"
  showIcon={true}
  className="mb-4"
/>
```

**Props**:
- `error`: Error object or string
- `size`: 'small', 'medium', 'large'
- `showIcon`: Boolean to show/hide error icon
- `className`: Additional CSS classes

---

## Error Utilities

### getErrorType(error)

Determines the error type based on error details.

```javascript
import { getErrorType } from '../utils/errorUtils';

const errorType = getErrorType(error);
// Returns: 'network', 'validation', 'duplicate', 'unauthorized', etc.
```

### getUserFriendlyErrorMessage(error)

Gets user-friendly error messages.

```javascript
import { getUserFriendlyErrorMessage } from '../utils/errorUtils';

const message = getUserFriendlyErrorMessage(error);
// Returns: "Unable to connect to the server. Please check your connection."
```

### getContextualErrorMessage(error, context)

Gets context-specific error messages.

```javascript
import { getContextualErrorMessage } from '../utils/errorUtils';

const message = getContextualErrorMessage(error, 'link');
// Returns: "A link with this URL already exists in your collection."
```

**Supported Contexts**:
- `link`: Link management operations
- `profile`: Profile operations
- `auth`: Authentication operations
- `general`: Default context

### Error Type Checkers

```javascript
import { 
  isNetworkError, 
  isAuthError, 
  isValidationError, 
  isDuplicateError 
} from '../utils/errorUtils';

if (isNetworkError(error)) {
  // Handle network error
}
```

---

## Custom Hooks

### useErrorReporting

**Purpose**: Centralized error reporting and tracking.

```javascript
import { useErrorReporting } from '../hooks';

const errorReporting = useErrorReporting({
  component: 'MyComponent',
  module: 'UserManagement',
  enableConsoleLogging: true,
  enableExternalReporting: false
});

// Report different types of errors
errorReporting.reportError(error, { action: 'User Action' });
errorReporting.reportNetworkError(error, '/api/endpoint');
errorReporting.reportValidationError(error, formData, 'email');

// Get error statistics
const stats = errorReporting.getErrorStats();
```

### useAsync (Enhanced)

**Purpose**: Async operations with error handling and retry capabilities.

```javascript
import { useAsync } from '../hooks';

const { execute, loading, error, retry, isRetrying } = useAsync(
  null, // async function (optional)
  false, // immediate execution
  {
    maxRetries: 2,
    retryDelay: 1000,
    context: 'link',
    onError: (error, context) => {
      console.error('Async error:', error);
    }
  }
);

// Execute async operation
const result = await execute(async () => {
  return await apiCall();
});
```

### useRetry (Enhanced)

**Purpose**: Advanced retry functionality with exponential backoff.

```javascript
import { useRetry } from '../hooks';

const { 
  retry, 
  isRetrying, 
  attemptCount, 
  canRetry,
  retryStats 
} = useRetry(
  async () => await apiCall(),
  {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponentialBackoff: true,
    shouldRetry: (error, attempt) => isNetworkError(error),
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} in ${delay}ms`);
    }
  }
);
```

---

## Implementation Patterns

### 1. Component Error Handling

```jsx
import React from 'react';
import { ErrorDisplay } from '../components/common/error';
import { useAsync, useErrorReporting } from '../hooks';
import { getContextualErrorMessage } from '../utils/errorUtils';

const MyComponent = () => {
  const errorReporting = useErrorReporting({ 
    component: 'MyComponent' 
  });
  
  const { execute, loading, error } = useAsync(null, false, {
    context: 'general',
    onError: (error, context) => {
      errorReporting.reportError(error, context);
    }
  });

  const handleSubmit = async (formData) => {
    try {
      await execute(async () => {
        return await apiService.submitData(formData);
      });
    } catch (err) {
      // Error handled by useAsync hook
    }
  };

  return (
    <div>
      {error && <ErrorDisplay error={error} />}
      <form onSubmit={handleSubmit}>
        {/* form content */}
      </form>
    </div>
  );
};
```

### 2. Service Layer Error Handling

```javascript
// services/ApiService.js
import { getContextualErrorMessage } from '../utils/errorUtils';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, options);
      
      if (!response.ok) {
        const error = new Error(`API Error: ${response.status}`);
        error.status = response.status;
        error.endpoint = endpoint;
        throw error;
      }
      
      return await response.json();
    } catch (error) {
      // Enhance error with context
      const contextualMessage = getContextualErrorMessage(error, 'api');
      const enhancedError = new Error(contextualMessage);
      enhancedError.originalError = error;
      enhancedError.endpoint = endpoint;
      
      throw enhancedError;
    }
  }
}
```

### 3. Modal Error Handling

```jsx
import React, { useState } from 'react';
import { Modal, ErrorDisplay } from '../components/common';
import { getContextualErrorMessage } from '../utils/errorUtils';

const MyModal = ({ isOpen, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      await apiService.submitData(data);
      onClose();
    } catch (err) {
      const errorMessage = getContextualErrorMessage(err, 'form');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {error && (
        <ErrorDisplay 
          error={error}
          size="medium"
          className="mb-4"
        />
      )}
      {/* modal content */}
    </Modal>
  );
};
```

### 4. Route-Level Error Boundaries

```jsx
// App.jsx
import { ErrorBoundary, ErrorState } from './components/common/error';

<Routes>
  <Route 
    path="/dashboard" 
    element={
      <ErrorBoundary fallback={<ErrorState type="general" />}>
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </ErrorBoundary>
    } 
  />
</Routes>
```

---

## Testing Guidelines

### Testing Error Boundaries

```jsx
// __tests__/errorBoundary.test.jsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../components/common/error';

const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Success</div>;
};

test('error boundary catches errors', () => {
  render(
    <ErrorBoundary fallback={<div>Error caught</div>}>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );
  
  expect(screen.getByText('Error caught')).toBeInTheDocument();
});
```

### Testing Error Handling Hooks

```jsx
import { renderHook, act } from '@testing-library/react';
import { useErrorReporting } from '../hooks';

test('useErrorReporting tracks errors', () => {
  const { result } = renderHook(() => useErrorReporting());
  
  act(() => {
    result.current.reportError(new Error('Test error'));
  });
  
  const stats = result.current.getErrorStats();
  expect(stats.totalErrors).toBe(1);
});
```

### Testing Error Components

```jsx
import { render, screen } from '@testing-library/react';
import { ErrorDisplay } from '../components/common/error';

test('ErrorDisplay shows error message', () => {
  render(<ErrorDisplay error="Test error message" />);
  expect(screen.getByText('Test error message')).toBeInTheDocument();
});
```

---

## Best Practices

### 1. Always Use Error Boundaries

- Wrap routes with ErrorBoundary components
- Use GlobalErrorBoundary at the app level
- Provide meaningful fallback UI

### 2. Centralize Error Logic

- Use errorUtils functions for error processing
- Implement getContextualErrorMessage for user-friendly messages
- Avoid duplicate error handling patterns

### 3. Consistent Error Reporting

- Use useErrorReporting hook for tracking
- Include relevant context in error reports
- Log errors appropriately for debugging

### 4. User-Friendly Error Messages

- Use contextual error messages
- Provide actionable error states
- Include retry options when appropriate

### 5. Error Recovery

- Implement retry mechanisms for network errors
- Provide clear recovery paths
- Reset error states after successful operations

### 6. Mobile-First Error Design

- Ensure error messages are readable on small screens
- Use appropriate touch targets for error actions
- Consider mobile-specific error scenarios

### 7. Testing Coverage

- Test error boundaries with different error types
- Test error handling hooks with various scenarios
- Test error recovery mechanisms

### 8. Performance Considerations

- Avoid excessive error reporting in production
- Implement error reporting throttling
- Clean up error listeners and timeouts

---

## Migration Guide

### From Custom Error Handling

**Before**:
```jsx
const [error, setError] = useState('');

try {
  await apiCall();
} catch (err) {
  if (err.message.includes('duplicate')) {
    setError('Duplicate entry');
  } else if (err.message.includes('network')) {
    setError('Network error');
  } else {
    setError('Something went wrong');
  }
}
```

**After**:
```jsx
import { getContextualErrorMessage } from '../utils/errorUtils';

const [error, setError] = useState('');

try {
  await apiCall();
} catch (err) {
  const errorMessage = getContextualErrorMessage(err, 'form');
  setError(errorMessage);
}
```

### Adding Error Boundaries

**Before**:
```jsx
<Route path="/dashboard" element={<Dashboard />} />
```

**After**:
```jsx
<Route 
  path="/dashboard" 
  element={
    <ErrorBoundary fallback={<ErrorState type="general" />}>
      <Dashboard />
    </ErrorBoundary>
  } 
/>
```

---

## Troubleshooting

### Common Issues

1. **Error boundaries not catching errors**
   - Ensure errors occur during rendering
   - Check that ErrorBoundary is properly implemented
   - Verify error occurs in child components

2. **Infinite retry loops**
   - Set appropriate maxAttempts
   - Implement proper shouldRetry logic
   - Check for cleanup in useEffect

3. **Memory leaks in error reporting**
   - Clear timeouts in cleanup functions
   - Limit error history size
   - Abort ongoing operations in useEffect cleanup

### Debugging Tips

1. **Enable verbose error logging**:
   ```jsx
   const errorReporting = useErrorReporting({
     enableConsoleLogging: true
   });
   ```

2. **Check error statistics**:
   ```jsx
   const stats = errorReporting.getErrorStats();
   console.log('Error stats:', stats);
   ```

3. **Test error boundaries manually**:
   ```jsx
   // Add temporary error trigger for testing
   const [shouldError, setShouldError] = useState(false);
   if (shouldError) throw new Error('Test error');
   ```

---

## Conclusion

This error handling system provides:

- **Consistent Error Management**: Standardized patterns across the application
- **Better User Experience**: User-friendly error messages and recovery options
- **Improved Debugging**: Comprehensive error reporting and tracking
- **Mobile-First Design**: Optimized for mobile interactions
- **Maintainable Code**: Centralized error logic reduces duplication

Follow these patterns and guidelines to ensure robust error handling throughout the Lynqee application.
