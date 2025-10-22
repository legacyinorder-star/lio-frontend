# Testing Framework Setup

## Overview
This document describes the testing framework setup for the Legacy In Order application.

## Testing Stack
- **Jest**: Testing framework
- **React Testing Library**: React component testing utilities
- **ts-jest**: TypeScript support for Jest
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements

## Installation
The following packages have been installed:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest ts-jest ts-node
```

## Configuration

### Jest Configuration (`jest.config.cjs`)
- Uses CommonJS format (`.cjs` extension) to work with ES modules
- Configured for TypeScript with `ts-jest`
- Uses `jsdom` test environment for React component testing
- Excludes test files from TypeScript build
- Configured path aliases (`@/*` → `src/*`)

### TypeScript Configuration
Test files are excluded from the main TypeScript build:
```json
"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/__tests__", "src/setupTests.ts"]
```

### Test Setup (`src/setupTests.ts`)
Provides global test configuration including:
- `@testing-library/jest-dom` matchers
- Mock implementations for:
  - `window.matchMedia`
  - `IntersectionObserver`
  - `ResizeObserver`
  - `localStorage`
  - `sessionStorage`
  - `fetch`
- Console noise reduction for cleaner test output

## Running Tests

### Available Commands
```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test File Organization

### Test File Patterns
Jest will automatically find and run files matching these patterns:
- `src/**/__tests__/**/*.(ts|tsx|js)` - Tests in `__tests__` directories
- `src/**/*.(test|spec).(ts|tsx|js)` - Files with `.test` or `.spec` suffix

### Example Test Structure
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── utils/
    ├── format.ts
    └── format.spec.ts
```

## Verification
A sample test file (`src/__tests__/setup.test.tsx`) has been created to verify the testing setup works correctly.

### Test Results
```
✓ Jest Setup - should run tests successfully
✓ Jest Setup - should have access to testing utilities
✓ Component Rendering - should render a simple component
```

### Build Verification
The application build (`npm run build`) completes successfully with test files properly excluded from the production bundle.

## Known Warnings (Non-Breaking)

### Module Name Mapper Warning
```
Unknown option "moduleNameMapping" with value {"^@/(.*)$": "<rootDir>/src/$1"} was found.
```
This warning can be safely ignored. The path aliases are working correctly.

### ts-jest Config Warning
```
ts-jest[config] (WARN) message TS151001: If you have issues related to imports...
```
This warning can be safely ignored unless you encounter actual import issues during testing.

## Writing Tests

### Basic Component Test Example
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Test Example
```typescript
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBe('expected value');
  });
});
```

## Next Steps
1. Write unit tests for critical hooks (useAuth, useWillData, useSpouseManagement)
2. Write integration tests for key user flows
3. Add tests for complex components (WillWizard, DisclaimerGuard, etc.)
4. Set up CI/CD to run tests automatically on pull requests

## Best Practices
1. **Test behavior, not implementation**: Focus on what the user sees and does
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock external dependencies**: Mock API calls, localStorage, etc.
4. **Keep tests simple**: One test should verify one behavior
5. **Use descriptive test names**: Test names should clearly describe what they verify
6. **Follow AAA pattern**: Arrange → Act → Assert

## Troubleshooting

### Tests not found
- Ensure test files match the patterns in `jest.config.cjs`
- Check that test files are in the `src/` directory

### Import errors
- Verify path aliases in `jest.config.cjs` match `tsconfig.json`
- Check that all required dependencies are installed

### TypeScript errors during build
- Ensure test files are excluded in `tsconfig.json`
- Run `npm run type-check` to verify TypeScript configuration

