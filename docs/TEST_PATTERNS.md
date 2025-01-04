# Test Patterns

## Overview

This document outlines the testing patterns and requirements for the monorepo. We follow a structured approach to testing that ensures code quality, maintainability, and reliability.

## Test Types and File Organization

### 1. Unit Tests (*.spec.ts)
- Co-located with source files
- Tests individual units of code in isolation
- Naming: `{source-file}.spec.ts`
- Example: `repository.ts` → `repository.spec.ts`
- Purpose: Specify implementation behavior

### 2. Integration Tests (__tests__/*.test.ts)
- Located in `__tests__` directory
- Tests interaction between components
- Validates application behavior
- Example: `__tests__/integration/auth.test.ts`
- Purpose: Verify component integration

### 3. User Requirement Specs (__tests__/*.spec.ts)
- Located in `__tests__` directory
- Documents business requirements as tests
- Serves as living documentation
- Example: `__tests__/requirements/user-management.spec.ts`
- Purpose: Document and verify business requirements

Note: While both unit tests and user requirement specs use `.spec.ts` extension, their location and purpose differ:
- `.spec.ts` next to source: Implementation specifications
- `.spec.ts` in `__tests__`: Business requirements
- This separation helps maintain clear boundaries between technical and business concerns

## Test Case Naming Pattern

### Format: [MODULE-TYPE0000]
- MODULE: Uppercase module name (e.g., REPO, AUTH)
- TYPE: Single character operation type
  - C: Create
  - R: Read
  - U: Update
  - D: Delete
  - E: Exists/Validation
  - A: Archive
- 0000: Four-digit number starting at 0010, incrementing by 10

### Examples:
```typescript
it('[REPO-C0010] should create record', async () => {});
it('[REPO-R0010] should find record by id', async () => {});
it('[REPO-U0010] should update record', async () => {});
```

## Test Structure

### 1. Arrange-Act-Assert Pattern
```typescript
it('[TYPE-0010] should do something', async () => {
  // Arrange
  const data = createTestData();

  // Act
  const result = await someFunction(data);

  // Assert
  expect(result).toBe(expected);
});
```

### 2. Test Grouping
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('[TYPE-0010] should handle success case', async () => {});
    it('[TYPE-0020] should handle error case', async () => {});
  });
});
```

## Test Data Management

### 1. Factory Functions
- Create reusable factory functions for test data
- Name factories descriptively (e.g., `createTestUser`, `createTestOrder`)
- Make data intention clear through function names and parameters
- Use TypeScript types to ensure data correctness

### 2. Factory Location
- Shared factories: Place in `test-utils` directory
  ```typescript
  // test-utils/factories/user.factory.ts
  export const createTestUser = (overrides = {}) => ({
    id: createMockObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  });
  ```
- Test-specific factories: Co-locate with tests
  ```typescript
  // user.service.spec.ts
  const createTestUserInput = (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  });
  ```

### 3. Factory Best Practices
- Use meaningful defaults
- Allow overrides for flexibility
- Keep factories focused and simple
- Document special cases or requirements
- Use TypeScript for type safety

## Mocking Guidelines

### 1. Mock Location
- Unit test mocks should be co-located with tests
- Shared mocks should be in `test-utils` directory
- Example: `test-utils/mongoose.mock.ts`

### 2. Mock Naming
- Suffix with `.mock.ts`
- Prefix functions with `createMock`
- Example: `createMockMongooseModel()`

## Test Coverage Requirements

### 1. Unit Tests
- Methods: 100% coverage
- Branches: 90% coverage
- Lines: 90% coverage

### 2. Integration Tests
- Critical paths: 100% coverage
- Error scenarios: 90% coverage
- Edge cases: Required for known issues

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after tests

### 2. Test Data
- Use factory functions for test data
- Avoid sharing state between tests
- Make test data intention clear

### 3. Assertions
- Use explicit assertions
- Test both positive and negative cases
- Verify side effects when necessary

### 4. Async Testing
- Always use async/await
- Handle promises correctly
- Test timeouts when relevant

## Example Test File

```typescript
import { Something } from './something';
import { createMockDependency } from './test-utils/mock';
import { createTestData } from './test-utils/factories';

describe('Something', () => {
  let instance: Something;
  let mockDep;

  beforeEach(() => {
    mockDep = createMockDependency();
    instance = new Something(mockDep);
  });

  describe('create', () => {
    it('[SOME-C0010] should create successfully', async () => {
      const data = createTestData({ name: 'test' });
      const result = await instance.create(data);
      expect(result).toMatchObject(data);
    });

    it('[SOME-C0020] should handle validation error', async () => {
      const data = createTestData({ name: '' });
      await expect(instance.create(data)).rejects.toThrow();
    });
  });
});
```

## Testing Tools

### 1. Jest
- Primary testing framework
- Used for all test types
- Configured in `jest.config.base.mjs`

### 2. Test Utilities
- Located in `test-utils` directories
- Shared across related tests
- Promotes code reuse

## Continuous Integration

### 1. Pre-commit Hooks
- Run unit tests
- Check test naming
- Verify coverage

### 2. CI Pipeline
- Run all tests
- Generate coverage reports
- Block merges on failures 