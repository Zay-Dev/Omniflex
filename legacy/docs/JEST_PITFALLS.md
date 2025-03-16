# Jest Pitfalls and Solutions

## Overview

This document catalogs common Jest pitfalls encountered in our codebase and their solutions. It serves as a reference to help team members avoid and troubleshoot common testing issues.

## Hoisting Issues

### 1. Variable Access in Mocks
```typescript
// ❌ Problem: Variables undefined due to hoisting
const mockData = { id: '1' };
jest.mock('./module', () => ({
  getData: () => mockData  // mockData will be undefined
}));

// ✅ Solution 1: Define everything inside mock
jest.mock('./module', () => ({
  getData: () => ({ id: '1' })  // Self-contained
}));

// ❌ Problem: Function expression won't be hoisted
const createMockData = () => ({ id: '1' });
jest.mock('./module', () => ({
  getData: () => createMockData()  // createMockData will be undefined
}));

// ✅ Solution 2: Use function declaration (gets hoisted)
function createMockData() {
  return { id: '1' };
}
jest.mock('./module', () => ({
  getData: () => createMockData()  // Works because function declarations are hoisted
}));

// ✅ Solution 3: Define factory inside mock
jest.mock('./module', () => {
  const createMockData = () => ({ id: '1' });
  return {
    getData: () => createMockData()
  };
});

// ✅ Solution 4: Use a separate mock module with ES Modules
// mockData.ts
export const createMockData = () => ({ id: '1' });

// test file
// ❌ Problem: require() doesn't work with ES Modules
jest.mock('./module', () => ({
  getData: () => require('./mockData').createMockData()  // Won't work with ESM
}));
```

### 2. Class Instance Checks
```typescript
// ❌ Problem: Class not defined when mock is hoisted
class TestModel extends BaseModel {}
jest.mock('./module', () => ({
  model: new TestModel()  // TestModel is undefined
}));

// ✅ Solution 1: Use prototype chain
jest.mock('./module', () => ({
  model: {
    __proto__: BaseModel.prototype,
    method: jest.fn()
  }
}));

// ✅ Solution 2: Define class inside mock
jest.mock('./module', () => {
  class TestModel extends BaseModel {
    method = jest.fn()
  }
  return {
    model: new TestModel()
  };
});
```

## Mock Implementation Issues

### 1. Incomplete Mocks
```typescript
// ❌ Problem: Missing required methods
jest.mock('./repository', () => ({
  findOne: jest.fn(),  // Missing other required methods
}));

// ✅ Solution: Mock all required methods
jest.mock('./repository', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));
```

## Type Issues

### 1. Container Mocking
```typescript
// ❌ Problem: Incomplete container structure
const mockContainer = {
  dependency: mockDep  // Missing cradle structure
};

// ✅ Solution: Match real container structure
const mockContainer = {
  cradle: {
    dependency: mockDep
  },
  resolve: jest.fn((key: string) => mockContainer.cradle[key])
} as unknown as AwilixContainer<TTestContainer>;
```

## Test Isolation Issues

### 1. Shared State
```typescript
// ❌ Problem: Tests affect each other
let sharedData;
beforeAll(() => {
  sharedData = createTestData();
});

// ✅ Solution: Reset state between tests
let testData;
beforeEach(() => {
  testData = createTestData();
});
```

### 2. Mock Reset
```typescript
// ❌ Problem: Mock calls persist between tests
const mock = jest.fn();

// ✅ Solution: Clear mocks in beforeEach
beforeEach(() => {
  jest.clearAllMocks();
});
```


## Real-World Examples

### 1. Model Instance Checks
From our recent experience with Sequelize models:
```typescript
// ❌ Problem: Model class not available during mock
class TestModel extends Model {}
jest.mock('@omniflex/core', () => ({
  model: new TestModel()  // Fails due to hoisting
}));

// ✅ Solution: Use prototype chain
jest.mock('@omniflex/core', () => ({
  model: {
    modelName: 'TestModel',
    tableName: 'test_table',
    findOne: jest.fn(),
    findAll: jest.fn(),
    __proto__: Model.prototype
  }
}));
```

### 2. Container Mocking
From our DI container tests:
```typescript
// ❌ Problem: Missing container structure
jest.mock('@omniflex/core', () => ({
  Containers: {
    dependency: mockDep  // Incorrect structure
  }
}));

// ✅ Solution: Match real container structure
jest.mock('@omniflex/core', () => {
  const mockContainer = {
    cradle: {
      dependency: mockDep
    },
    resolve: jest.fn((key: string) => mockContainer.cradle[key])
  } as unknown as AwilixContainer<TTestContainer>;

  return {
    Containers: {
      appContainerAs: jest.fn().mockReturnValue(mockContainer)
    }
  };
});
```