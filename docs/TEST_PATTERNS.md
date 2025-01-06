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

## Repository Test Patterns

### 1. File Organization
```typescript
// Source file: repository.ts
export class UserRepository { }

// Unit test: repository.spec.ts (co-located)
describe('UserRepository', () => { });

// Integration test: __tests__/integration/repository.test.ts
describe('UserRepository Integration', () => { });
```

### 2. Test Utilities Organization
```
project/
├── test-utils/
│   ├── mongoose.test-utils.ts   # Mongoose specific utilities
│   ├── sequelize.test-utils.ts  # Sequelize specific utilities
│   └── factories/
│       └── user.factory.ts      # Entity specific factories
```

### 3. Database Lifecycle Management
```typescript
describe('Repository Tests', () => {
  // Setup database
  beforeAll(async () => {
    await setupTestDatabase();
  });

  // Clear data between tests
  beforeEach(async () => {
    await clearTestData();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await closeTestDatabase();
  });
});
```

### 4. Repository Test Coverage Requirements
- Base Operations:
  - Create: [REPO-C0010] create record
  - Read: [REPO-R0010] findById, [REPO-R0020] findOne, [REPO-R0030] find
  - Update: [REPO-U0010] updateById, [REPO-U0020] updateOne, [REPO-U0030] update
  - Delete: [REPO-D0010] deleteById, [REPO-D0020] deleteOne, [REPO-D0030] delete
  - Archive: [REPO-A0010] softDeleteById, [REPO-A0020] softDeleteOne
  - Restore: [REPO-S0010] restoreById, [REPO-S0020] restoreOne
- Query Options:
  - [REPO-Q0010] pagination (skip/take)
  - [REPO-Q0020] sorting
  - [REPO-Q0030] paranoid mode
- Error Cases:
  - [REPO-E0010] invalid id format
  - [REPO-E0020] record not found
  - [REPO-E0030] validation errors

### 5. Mock Utilities
```typescript
// mongoose.test-utils.ts
export const createMockMongooseModel = (options) => ({
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  // ... other methods
});

// sequelize.test-utils.ts
export const createTestSequelize = () => new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
});

export const createTestModel = (sequelize, name, schema) => 
  sequelize.define(name, schema, {
    timestamps: true,
    paranoid: true,
  });
```

### 6. Factory Best Practices
```typescript
// user.factory.ts
export const createTestUser = (overrides = {}) => ({
  id: createMockId(),
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

// In tests
const user = createTestUser({ name: 'Custom Name' });
```

### 7. Test Case Organization
```typescript
describe('UserRepository', () => {
  describe('base operations', () => {
    // Group basic CRUD operations
    it('[REPO-C0010] should create record', async () => {});
    it('[REPO-R0010] should find by id', async () => {});
  });

  describe('query options', () => {
    // Group query-related tests
    it('[REPO-Q0010] should handle pagination', async () => {});
    it('[REPO-Q0020] should handle sorting', async () => {});
  });

  describe('error cases', () => {
    // Group error scenarios
    it('[REPO-E0010] should handle invalid id', async () => {});
    it('[REPO-E0020] should handle not found', async () => {});
  });
});
```

### 8. Assertion Best Practices

#### General Guidelines
```typescript
// ✅ Good: Start with simple truthy/falsy assertions
it('[REPO-R0010] should find existing record', async () => {
  const result = await repository.findById('123');
  expect(result).toBeTruthy();
});

it('[REPO-R0020] should not find non-existent record', async () => {
  const result = await repository.findById('456');
  expect(result).toBeFalsy();
});

// ✅ Good: Add specific assertions in separate test cases when needed
it('[REPO-R0030] should return record with correct shape', async () => {
  const result = await repository.findById('123');
  expect(result).toEqual(expect.objectContaining({
    id: expect.any(String),
    name: expect.any(String),
  }));
});

// ❌ Bad: Too specific in basic test cases
it('should return null for non-existent record', async () => {
  const result = await repository.findById('456');
  expect(result).toBeNull();  // Too specific
});

// ❌ Bad: Multiple assertions mixing concerns
it('should find and validate record', async () => {
  const result = await repository.findById('123');
  expect(result).not.toBeNull();  // Too specific
  expect(result.id).toBeDefined();  // Too granular
  expect(result.name).toBe('test');  // Mixing existence check with value check
});
```

#### Progressive Assertion Pattern
1. Start with existence check
```typescript
it('[REPO-R0010] should find record', async () => {
  expect(await repository.findById('123')).toBeTruthy();
});
```

2. Add shape check if needed
```typescript
it('[REPO-R0020] should return record with required fields', async () => {
  const result = await repository.findById('123');
  expect(result).toEqual(expect.objectContaining({
    id: expect.any(String),
  }));
});
```

3. Add specific value checks if required
```typescript
it('[REPO-R0030] should return correct record data', async () => {
  const result = await repository.findById('123');
  expect(result.name).toBe('test');
});
```

#### When to Add Specific Assertions
1. Basic existence tests (toBeTruthy/toBeFalsy):
   - Always include these
   - Quick to write and maintain
   - Verifies basic functionality
   - Sufficient for most cases

2. Shape tests (objectContaining):
   - Add when response structure is part of the API contract
   - Add when downstream code depends on the structure
   - Add when schema validation is critical
   - Consider partial matching over exact matching

3. Value tests (exact matches):
   - Add when specific values are business requirements
   - Add when testing calculations or transformations
   - Add when testing critical business logic
   - Consider as implementation detail

#### Progressive Test Naming Pattern
- Basic: `should find/create/update {entity}`
- Shape: `should return {entity} with {structure}`
- Value: `should return {entity} with {specific detail}`

#### Examples
```typescript
// Basic - existence only
it('[REPO-R0010] should find user', async () => {
  expect(await repository.findById('123')).toBeTruthy();
});

// Shape - when structure matters
it('[REPO-R0020] should return user with profile', async () => {
  const result = await repository.findById('123');
  expect(result).toEqual(expect.objectContaining({
    profile: expect.any(Object),
  }));
});

// Value - when specific data matters
it('[REPO-R0030] should return user with correct role', async () => {
  const result = await repository.findById('123');
  expect(result.role).toBe('admin');
});

// ❌ Bad: Mixing concerns
it('should return complete user data', async () => {
  const result = await repository.findById('123');
  expect(result).not.toBeNull();  // Existence
  expect(result.profile).toBeDefined();  // Shape
  expect(result.role).toBe('admin');  // Value
});
```

#### Error Assertions
```typescript
// ✅ Good: Simple error existence check
it('[REPO-E0010] should throw on invalid input', async () => {
  await expect(repository.create({})).rejects.toBeTruthy();
});

// ✅ Good: Add specific error check in separate test
it('[REPO-E0020] should throw validation error', async () => {
  await expect(repository.create({}))
    .rejects.toThrow('Validation error');
});

// ❌ Bad: Too specific in basic test
it('should handle invalid input', async () => {
  await expect(repository.create({}))
    .rejects.toThrow(ValidationError);  // Too specific
});
```

#### Collection Assertions
```typescript
// ✅ Good: Simple length check
it('[REPO-R0040] should find multiple records', async () => {
  const results = await repository.find({});
  expect(results.length).toBeGreaterThan(0);
});

// ✅ Good: Add specific checks in separate test
it('[REPO-R0050] should return records with correct shape', async () => {
  const results = await repository.find({});
  results.forEach(result => {
    expect(result).toEqual(expect.objectContaining({
      id: expect.any(String),
    }));
  });
});

// ❌ Bad: Too specific in basic test
it('should find records', async () => {
  const results = await repository.find({});
  expect(Array.isArray(results)).toBe(true);  // Too specific
  expect(results).toHaveLength(2);  // Too rigid
});
```

### 9. Test Utility Reuse Guidelines

#### Infrastructure Layer Utilities
- Reuse utilities from infra layer when testing common patterns:
  ```typescript
  // ✅ Good: Reuse infra layer utilities
  import { createMockMongooseModel } from '@omniflex/infra-mongoose/test-utils/mongoose.mock';
  import { createTestSequelize } from '@omniflex/infra-sequelize-v6/test-utils/sequelize.test-utils';
  ```

#### Module-Specific Utilities
- Create module-specific utilities for:
  - Entity factories
  - Domain-specific test data
  - Custom test scenarios
  ```typescript
  // ✅ Good: Module-specific factory
  import { createTestUser } from './test-utils/factories/user.factory';
  ```

#### Utility Location Decision Tree
1. Is it testing infrastructure behavior?
   - Yes → Use infra layer utilities
   - No → Continue to 2
2. Is it specific to this module's domain?
   - Yes → Create module-specific utility
   - No → Continue to 3
3. Is it a common pattern across modules?
   - Yes → Consider adding to infra layer
   - No → Create module-specific utility

#### Examples
```typescript
// Infrastructure pattern - use infra layer utility
const mockModel = createMockMongooseModel({
  collection: { name: 'users' }
});

// Domain-specific - create module utility
const testUser = createTestUser({
  role: 'admin',
  permissions: ['read', 'write']
});

// Common pattern - consider adding to infra
const mockRepository = createMockRepository<User>({
  findOne: jest.fn()
});
``` 

### 10. Common Error Scenarios

#### Repository Error Cases
```typescript
describe('error cases', () => {
  // Invalid input - basic check
  it('[REPO-E0010] should reject invalid input', async () => {
    await expect(repository.findById('invalid-id')).rejects.toBeTruthy();
  });

  // Invalid input - specific error (if needed)
  it('[REPO-E0020] should reject with format error', async () => {
    await expect(repository.findById('invalid-id'))
      .rejects.toThrow('Invalid id format');
  });

  // Not found - basic check
  it('[REPO-E0030] should handle non-existent record', async () => {
    const result = await repository.findById('non-existent-id');
    expect(result).toBeFalsy();
  });

  // Soft delete - basic check
  it('[REPO-E0040] should handle soft deleted record', async () => {
    const record = await createTestRecord();
    await repository.softDeleteById(record.id);
    expect(await repository.findById(record.id)).toBeFalsy();
  });

  // Validation - basic check
  it('[REPO-E0050] should reject invalid data', async () => {
    await expect(repository.create({})).rejects.toBeTruthy();
  });

  // Validation - specific error (if needed)
  it('[REPO-E0060] should reject with validation details', async () => {
    await expect(repository.create({}))
      .rejects.toThrow('Validation error');
  });

  // Unique constraint - basic check
  it('[REPO-E0070] should reject duplicate data', async () => {
    await repository.create({ email: 'test@example.com' });
    await expect(
      repository.create({ email: 'test@example.com' })
    ).rejects.toBeTruthy();
  });

  // Unique constraint - specific error (if needed)
  it('[REPO-E0080] should reject with uniqueness error', async () => {
    await repository.create({ email: 'test@example.com' });
    await expect(
      repository.create({ email: 'test@example.com' })
    ).rejects.toThrow('Unique constraint violation');
  });
});

#### When to Add Specific Error Tests
1. Basic error tests (toBeTruthy/toBeFalsy):
   - Always include these
   - Quick to write and maintain
   - Catches existence of errors

2. Specific error tests (toThrow with message):
   - Add when error details are part of the API contract
   - Add when error handling logic is critical
   - Add when debugging support is important

3. Error type tests (instanceof checks):
   - Rarely needed
   - Add only when error type is critical for error handling
   - Consider as implementation detail

#### Error Test Naming Pattern
- Basic: `should reject/handle {scenario}`
- Specific: `should reject/handle with {detail}`
- Type: `should throw {error type}`

### 11. Database-Specific Test Configurations

#### SQLite (for Sequelize)
```typescript
// sequelize.test-utils.ts
export const createTestSequelize = () => new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',  // In-memory for fast tests
  logging: false,
  define: {
    timestamps: true,
    paranoid: true,
  },
});

// Usage in tests
describe('Repository Tests', () => {
  const sequelize = createTestSequelize();
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
});
```

#### MongoDB (for Mongoose)
```typescript
// mongoose.test-utils.ts
export const createTestMongoose = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  return {
    uri,
    cleanup: async () => {
      await mongod.stop();
    }
  };
};

// Usage in tests
describe('Repository Tests', () => {
  let mongod;
  
  beforeAll(async () => {
    const { uri, cleanup } = await createTestMongoose();
    mongod = { uri, cleanup };
    await mongoose.connect(uri);
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.cleanup();
  });
});

#### Test Database Guidelines
1. Use in-memory databases when possible
   - SQLite for Sequelize tests
   - mongodb-memory-server for Mongoose tests
2. Clean state between tests
   - Use `beforeEach` to reset data
   - Use transactions when supported
3. Parallel test safety
   - Each test file should use isolated database
   - Use unique database names/collections
4. Performance considerations
   - Reuse database connection across tests
   - Use transactions over full cleanup when possible
   - Consider batch operations for setup/cleanup 

## Container Mocking Patterns

### Unit Tests (.spec.ts)
```typescript
// Define container type for test
type TTestContainer = {
  dependency: {
    method: jest.Mock;
  };
};

// Mock at module level
jest.mock('@omniflex/core', () => {
  const mockDependency = {
    method: jest.fn()
  };

  const mockContainer = {
    cradle: {
      dependency: mockDependency
    },
    resolve: jest.fn((key: string) => mockContainer.cradle[key]),
  } as unknown as AwilixContainer<TTestContainer>;

  return {
    Containers: {
      appContainerAs: jest.fn().mockReturnValue(mockContainer)
    }
  };
});

// Use in tests
it('should use container', () => {
  const container = Containers.appContainerAs<TTestContainer>();
  expect(container.cradle.dependency.method)
    .toHaveBeenCalled();
});
```

### Integration Tests (.test.ts)
```typescript
// Use real container with test dependencies
beforeAll(async () => {
  const container = Containers.appContainerAs<TTestContainer>();
  container.register({
    dependency: asValue(createTestDependency())
  });
});
```

### Container Mocking Guidelines

1. Module-Level Mocking:
   - Mock external dependencies at module level
   - Use jest.mock for container dependencies
   - Define proper types for test containers
   - Structure mocks to match real implementations

2. Type Safety:
   - Define explicit types for test containers
   - Use TypeScript generics with appContainerAs
   - Avoid type casting with 'as any'
   - Match real container structure with cradle

3. Mock Structure:
   - Include all required methods and properties
   - Match the real implementation's structure
   - Include resolve method for container
   - Clear mocks between tests

4. Best Practices:
   - Keep mocks minimal but complete
   - Clear mocks in beforeEach
   - Type container contents explicitly
   - Mock only what the test needs

### Example: Mongoose Model Mock
```typescript
// Good: Complete mock with proper structure
const mockModel = {
  schema: {
    alias: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  },
  recompileSchema: jest.fn(),
};

// Bad: Incomplete mock missing required methods
const mockModel = {
  schema: {},  // Missing required methods
};
```

### Example: Container Mock
```typescript
// Good: Properly typed with cradle
type TTestContainer = {
  dependency: {
    method: jest.Mock;
  };
};

const mockContainer = {
  cradle: {
    dependency: mockDependency
  },
  resolve: jest.fn((key: string) => mockContainer.cradle[key]),
} as unknown as AwilixContainer<TTestContainer>;

// Bad: Missing cradle or improper structure
const mockContainer = {
  dependency: mockDependency  // Missing cradle structure
};
```