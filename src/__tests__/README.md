# Testing Infrastructure Documentation

## Overview

This document outlines the testing infrastructure for the Lynqee project, implementing comprehensive testing patterns following industry best practices.

## Structure

```
src/
├── __tests__/                    # Main testing directory
│   ├── setup.js                  # Global test configuration
│   ├── mocks/                    # Shared mocks and utilities
│   │   └── testUtils.jsx         # Test utilities and mock providers
│   ├── components/               # Component tests (mirrors src/components)
│   │   ├── auth/                 # Authentication component tests
│   │   ├── common/               # Common component tests
│   │   │   ├── Avatar.test.jsx
│   │   │   └── Button.test.jsx
│   │   ├── links/                # Links component tests
│   │   └── profile/              # Profile component tests
│   ├── hooks/                    # Custom hook tests
│   │   ├── useAuth.test.js
│   │   └── useFormValidation.test.js
│   ├── services/                 # Service layer tests
│   │   └── AuthService.test.js
│   └── utils/                    # Utility function tests
│       └── validators.test.js
```

## Technology Stack

### Core Testing Framework
- **Vitest** (v3.2.4): Fast test runner with Vite integration
- **React Testing Library** (v16.3.0): Component testing utilities
- **jsdom** (v25.0.1): DOM environment simulation

### Development Tools
- **ESLint Plugin Vitest**: Linting rules for test files
- **@vitest/coverage-v8**: Code coverage reporting

## Configuration Files

### vite.config.js
```javascript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/__tests__/setup.js',
  css: true,
  coverage: {
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'src/__tests__/',
      '**/*.d.ts',
      '**/*.config.js',
      '**/index.js',
    ],
  },
}
```

### package.json Scripts
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

## Testing Patterns

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../mocks/testUtils.jsx';
import Component from '../../../components/path/Component.jsx';

describe('Component', () => {
  it('renders correctly', () => {
    renderWithProviders(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Testing
```javascript
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from '../../hooks/useCustomHook.js';

describe('useCustomHook', () => {
  it('returns expected values', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(expectedValue);
  });
});
```

### Service Testing
```javascript
import { vi } from 'vitest';
import Service from '../../services/Service.js';

vi.mock('../../services/supabase.js', () => ({
  default: mockSupabaseClient,
}));

describe('Service', () => {
  it('calls external dependencies correctly', async () => {
    await Service.method();
    expect(mockDependency).toHaveBeenCalled();
  });
});
```

## Available Test Utilities

### Mock Data
- `mockUser`: Authenticated user object
- `mockProfile`: User profile data
- `mockLinks`: Sample links array
- `mockSupabaseClient`: Mocked Supabase client

### Context Providers
- `renderWithProviders()`: Render with auth and app state context
- `renderWithUnauthenticatedUser()`: Render with unauthenticated state
- `renderWithLoadingState()`: Render with loading state
- `renderWithErrorState()`: Render with error state

### Utilities
- `createMockService()`: Generate mock service objects
- `waitForAsync()`: Helper for async operations

## Running Tests

### Development Mode
```bash
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with UI interface
```

### CI/Production
```bash
npm run test:run         # Run tests once
npm run test:coverage    # Run tests with coverage report
```

## Test File Naming Conventions

- Component tests: `ComponentName.test.jsx`
- Hook tests: `hookName.test.js`
- Service tests: `ServiceName.test.js`
- Utility tests: `utilityName.test.js`

## Best Practices

### 1. Test Organization
- Mirror the source directory structure in `__tests__`
- Group related tests in describe blocks
- Use descriptive test names

### 2. Component Testing
- Test behavior, not implementation
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user interactions with `fireEvent` or `userEvent`

### 3. Mock Usage
- Mock external dependencies (APIs, services)
- Use real implementations for internal logic
- Reset mocks between tests

### 4. Async Testing
- Use `await` for async operations
- Use `waitFor` for DOM updates
- Use `act` for state updates in hooks

### 5. Coverage Goals
- Aim for 80%+ code coverage
- Focus on critical business logic
- Don't test implementation details

## Continuous Integration

The testing infrastructure is configured to work with CI/CD pipelines:

```yaml
# Example GitHub Actions configuration
- name: Run Tests
  run: npm run test:run

- name: Generate Coverage
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Debugging Tests

### Common Issues
1. **Import path errors**: Ensure relative paths are correct
2. **Context missing**: Use `renderWithProviders` for components needing context
3. **Async operations**: Use proper async testing patterns

### Debug Tools
- `screen.debug()`: Print current DOM state
- `console.log(result.current)`: Debug hook values
- Vitest UI: Visual test debugging interface

## Next Steps

1. **Expand Coverage**: Add tests for remaining components
2. **Integration Tests**: Add end-to-end testing with Playwright
3. **Performance Tests**: Add performance testing for critical paths
4. **Visual Regression**: Consider adding visual testing tools

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
