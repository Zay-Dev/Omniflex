# Repository Patterns

## Overview

This document outlines the repository pattern implementation in our monorepo. Our approach focuses on maintaining a minimal, consistent interface for common operations while allowing direct ORM access for complex queries.

## Core Philosophy

### 1. Model-First Approach
- Models define the ORM-specific implementation and relationships
- Models are exported and can be used directly for complex operations
- Models handle ORM-specific features and optimizations

### 2. Minimal Repository Interface
- Provide essential CRUD operations through repositories
- Keep the interface simple and predictable
- Support common query patterns
- Avoid mixing ORM-specific complexities in repositories

## Interface Structure

### 1. Basic Operations
```typescript
interface IBaseRepository<T, TPrimaryKey> {
  // Validation
  isValidPrimaryKey(id: TPrimaryKey): boolean;

  // Read operations
  exists(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<boolean>;
  count(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number>;
  findById(id: TPrimaryKey, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  findOne(filter: TQueryFilter<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  find(filter: TQueryFilter<T>, options?: TQueryOptions<T>): Promise<T[]>;

  // Create operation
  create(data: Partial<T>): Promise<T>;

  // Update operations
  updateById(id: TPrimaryKey, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  updateOne(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<T | null>;
  update(filter: TQueryFilter<T>, data: Partial<T>, options?: Pick<TQueryOptions<T>, 'paranoid'>): Promise<number>;

  // Hard delete operations
  deleteById(id: TPrimaryKey): Promise<boolean>;
  deleteOne(filter: TQueryFilter<T>): Promise<boolean>;
  delete(filter: TQueryFilter<T>): Promise<number>;

  // Soft delete operations
  softDeleteById(id: TPrimaryKey): Promise<boolean>;
  softDeleteOne(filter: TQueryFilter<T>): Promise<boolean>;
  softDelete(filter: TQueryFilter<T>): Promise<number>;

  // Restore operations
  restoreById(id: TPrimaryKey): Promise<boolean>;
  restoreOne(filter: TQueryFilter<T>): Promise<boolean>;
  restore(filter: TQueryFilter<T>): Promise<number>;
}
```

### 2. Query Operators
```typescript
type TQueryOperators<T> = {
  $eq?: T;
  $ne?: T;
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $in?: T[];
  $nin?: T[];
  $regex?: RegExp;
};
```

### 3. Query Options
```typescript
type TQueryOptions<T> = {
  skip?: number;
  take?: number;
  sort?: {
    [P in keyof T]?: 'asc' | 'desc';
  };
  paranoid?: boolean;
};
```

## Usage Guidelines

### 1. Basic Operations
```typescript
// Use repository interface for basic operations
const users = await userRepo.find({ role: 'admin' });
const user = await userRepo.findById(userId);
const deleted = await userRepo.softDeleteOne({ status: 'inactive' });
const restored = await userRepo.restoreById(userId);
```

### 2. Complex Operations with Models

#### Mongoose Example
```typescript
// Define and export models with relationships
export const UserModel = mongoose.model('User', userSchema);
export const PostModel = mongoose.model('Post', postSchema);

// Use models directly for complex operations
const result = await UserModel
  .aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

const users = await UserModel
  .find({ status: 'active' })
  .populate('posts')
  .lean();
```

#### Sequelize Example
```typescript
// Define and export models with relationships
export const UserModel = sequelize.define('User', userSchema);
export const PostModel = sequelize.define('Post', postSchema);

UserModel.hasMany(PostModel);
PostModel.belongsTo(UserModel);

// Use models directly for complex operations
const users = await UserModel.findAll({
  attributes: [
    'id',
    [sequelize.fn('COUNT', sequelize.col('posts.id')), 'postCount']
  ],
  include: [{
    model: PostModel,
    attributes: []
  }],
  group: ['User.id']
});
```

## Best Practices

### 1. When to Use Repository Interface
- Basic CRUD operations
- Simple filtering
- Pagination
- Sorting
- Soft delete operations
- Restore operations

### 2. When to Use Models Directly
- Complex joins/relationships
- Aggregations
- ORM-specific features
- Performance optimization
- Custom queries

### 3. ORM-Specific Considerations

#### Mongoose
- Define schemas and models in a dedicated models file
- Export models for direct use when needed
- Use mongoose features like `populate()` and aggregation directly on models
- Consider using `lean()` for better performance

#### Sequelize
- Define models and relationships in a dedicated models file
- Export models for direct use when needed
- Use features like `include` and scopes directly on models
- Consider using raw queries for complex operations

### 4. Error Handling
- Repository methods handle basic error cases
- Complex error handling should be at service layer
- Use models directly when you need ORM-specific error handling

### 5. Model Definition Best Practices

#### Model Organization
```typescript
// Define types
export type TUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

// Define schema
const userSchema = {
  id: Types.id('UUID'),
  name: Types.requiredString(),
  email: Types.requiredString(),
  createdAt: Types.requiredDate(),
  updatedAt: Types.requiredDate(),
};

// Define model with relationships and indexes
export const UserModel = sequelize.define('User', userSchema, {
  paranoid: true,
  indexes: [
    { fields: ['email'], unique: true },
  ],
});

// Define relationships
UserModel.hasMany(PostModel, { foreignKey: 'userId', as: 'posts' });
PostModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
```

#### Model Initialization
```typescript
export const initializeDatabase = async () => {
  try {
    // Sync database schema
    await sequelize.sync();

    // Create default data if needed
    await UserModel.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};
```

## Testing

### 1. Repository Tests
- Test basic CRUD operations
- Verify query operator behavior
- Check pagination and sorting
- Validate soft delete functionality
- Test restore operations

### 2. Model Integration Tests
- Test complex queries using models
- Verify ORM-specific features
- Test relationships and joins
- Check performance critical operations

## Migration Guidelines

### 1. Existing Code
- Gradually migrate to new pattern
- Use models directly for complex queries
- Review and simplify where possible

### 2. New Features
- Start with repository interface for basic operations
- Use models directly for complex operations
- Document complex query requirements 