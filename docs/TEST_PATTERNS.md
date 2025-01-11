# Test Patterns

## Overview

Core testing patterns and requirements for the monorepo. Establishes common patterns and best practices.

## Test Types and Organization

The test organization follows the testing pyramid principle:
- Many unit tests at the base (fastest, most numerous)
- Fewer integration tests in the middle
- Fewer requirement tests at the top (slowest, fewest)

This ensures a good balance between test coverage, execution speed, and maintenance cost.

### 1. Unit Tests (*.spec.ts)
- Co-located with source files
- Tests individual units in isolation
- Example: `repository.ts` → `repository.spec.ts`
- Forms the base of testing pyramid
- Fast execution, high coverage
- Focus: Technical implementation details
- Written by: Developers
- Example: Testing individual repository methods

### 2. Integration Tests (__tests__/*.test.ts) 
- Located in `__tests__/integration` directory
- Tests component interactions and technical integration
- Example: `__tests__/integration/auth.test.ts`
- Middle of testing pyramid
- Slower than unit tests, tests multiple components
- Focus: Technical "how" - verifying components work together
- Written by: Developers
- Examples:
  - Repository working with database
  - Service layer calling multiple repositories
  - API endpoints connecting to services

### 3. Requirement Tests (features/*/specs)
- Located in feature-specific directories
- Tests complete business features and scenarios
- Focus: Business "what" - verifying system meets business needs
- Written by: Developers with product team input
- Development flow:
  1. Start as requirements documentation
  2. Evolve into test cases through TDD
  3. Maintain as living documentation
- Example structure:
  ```
  features/
  ├── auth/
  │   ├── specs/
  │   │   └── requirements.md    # Requirements + background
  │   └── __tests__/
  │       └── auth.spec.ts       # TDD tests
  ```
- Examples:
  - User registration flow with business rules
  - Order processing with validation
  - Access control based on user roles
- Top of testing pyramid
- Focuses on business requirements
- Combines documentation with tests

## Bug Testing Patterns

A specialized pattern for handling bug-driven development that combines documentation and prevention tests.

### Directory Structure
```
features/
├── auth/
│   ├── specs/                    # Original requirements
│   └── bugs/
│       ├── 2024-WK1/            # Weekly organization
│       │   ├── bug-001-user-login-timeout.unfixed-spec.ts  # In progress
│       │   └── bug-002-password-reset.spec.ts              # Fixed
│       └── 2024-WK2/
```

### File Naming Convention
- In Progress: `bug-{number}-{description}.unfixed-spec.ts`
- Fixed: `bug-{number}-{description}.spec.ts`
- Number: Sequential identifier (001, 002, etc.)
- Description: Brief, hyphen-separated description
- Extension indicates fix status and CI/CD inclusion

### Bug Documentation Pattern
Each bug test file combines documentation and prevention test using JSDoc comments:

```typescript
/**
 * @bug BUG-001
 * @title User Login Timeout
 * @status In Progress
 * @reportedIn v1.2.3
 * @relatedTests AUTH-R0010
 * 
 * @description
 * Users experience timeout during login when network is slow
 * 
 * @reproduction
 * 1. Simulate 3s network delay
 * 2. Attempt login with valid credentials
 * 3. System times out before response
 * 
 * @rootCause
 * Login timeout was set to 2s which is too short for some network conditions
 * 
 * @expectedFix
 * Increase timeout to 5s and add retry mechanism
 */

describe('BUG-001: User Login Timeout', () => {
  it('should handle network delays up to 5s', async () => {
    // This test will initially fail
    // The goal is to make it pass with the fix
    const result = await loginWithDelay(5000);
    expect(result).toBeTruthy();
  });

  it('should retry failed attempts', async () => {
    // Additional prevention test
    const result = await loginWithFailure(2);
    expect(result).toBeTruthy();
  });
});
```

### Benefits
1. **Documentation and Tests Together**
   - Bug details documented in JSDoc
   - Tests serve as living documentation
   - IDE support for easy navigation

2. **Historical Tracking**
   - Time-based organization (weekly folders)
   - Sequential bug numbering
   - Clear status indication in filename

3. **True TDD Approach**
   - Start with failing prevention test
   - Implement fix to make test pass
   - Rename file once fixed
   - Clear progress tracking

4. **Easy Discovery**
   - Descriptive filenames
   - Organized by time period
   - Status visible in filename

5. **Clean Structure**
   - One file per bug
   - Clear naming convention
   - Simple CI/CD integration

### Best Practices
1. Start with a failing prevention test
2. Include complete bug context in JSDoc
3. Use .unfixed-spec.ts for in-progress fixes
4. Rename to .spec.ts once fixed and passing
5. Configure CI/CD to exclude .unfixed-spec.ts
6. Keep weekly directories for manageable organization

## Test Case Naming

### Format: [MODULE-TYPE0000]
- MODULE: Uppercase module name (e.g., REPO, AUTH)
- TYPE: Operation type
  - C: Create
  - R: Read
  - U: Update
  - D: Delete
  - E: Exists/Validation
  - A: Archive
  - S: Soft Delete/Restore
  - Q: Query/Search
- 0000: Four-digit number starting at 0010, incrementing by 10

Example: `[REPO-C0010] should create record`

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
- Create reusable factory functions
- Use descriptive names
- Allow overrides for flexibility
- Keep factories focused and simple

### 2. Factory Location
- Shared factories: `test-utils` directory
- Test-specific factories: Co-locate with tests

## Mocking Guidelines

### 1. Mock Patterns
```typescript
// 1. Pure Object Mock (Preferred)
const mockModel = {
  method: jest.fn(),
  property: 'value'
};

// 2. Factory Function Mock
const createMockModel = () => ({
  method: jest.fn(),
  property: 'value'
});
```

### 2. Jest Hoisting
```typescript
// ✅ Do: Define inside mock
jest.mock('./module', () => ({
  something: 'value'
}));

// ✅ Do: Use factory pattern
const createMock = () => ({
  something: 'value'
});
```

## Test Coverage Requirements

- Methods: 100% coverage
- Branches: 90% coverage
- Lines: 90% coverage
- Critical paths: 100% coverage
- Error scenarios: 90% coverage

## Best Practices

### 1. Test Independence
- Each test should be independent
- Use `beforeEach` for setup
- Clean up after tests
- Avoid shared state

### 2. Assertions
- Start with existence checks (toBeTruthy/toBeFalsy)
- Add shape checks if needed (toMatchObject)
- Add specific value checks only when required
- Keep assertions focused and simple

### 3. Error Testing
```typescript
// Basic error check
it('[REPO-E0010] should reject invalid input', async () => {
  await expect(repository.create({})).rejects.toBeTruthy();
});

// Specific error check (when needed)
it('[REPO-E0020] should reject with validation error', async () => {
  await expect(repository.create({}))
    .rejects.toThrow('Validation error');
});
```

### 4. Database Testing
- Use in-memory databases when possible
- Clean state between tests
- Ensure parallel test safety
- Reuse connections for performance

## Repository Test Coverage

### Required Test Cases
- Create: [REPO-C0010] create record
- Read: [REPO-R0010] findById, [REPO-R0020] findOne
- Update: [REPO-U0010] updateById, [REPO-U0020] updateOne
- Delete: [REPO-D0010] deleteById, [REPO-D0020] deleteOne
- Query: [REPO-Q0010] pagination, [REPO-Q0020] sorting
- Errors: [REPO-E0010] invalid input, [REPO-E0020] not found