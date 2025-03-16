# Sequelize v6 Pitfalls

This document outlines various pitfalls and unexpected behaviors encountered when using Sequelize v6.

## Model Field Declarations

### Issue: Missing 'declare' for Model Fields

When defining Sequelize models in TypeScript, fields must be declared using the `declare` keyword. Without it, created instances may have null values for fields that should be auto-generated (like `id`).

```typescript
// Incorrect - may result in null values
class User extends Model {
  id!: number;
  name!: string;
}

// Correct - use 'declare' keyword
class User extends Model {
  declare id: number;
  declare name: string;
}
```

This is particularly important for:
- Auto-incrementing primary keys
- Fields with default values
- Required fields that should never be null

## Repository Paranoid Mode Behavior

### Issue: Explicit `deletedAt: null` Query Returns No Results

When using our Sequelize repository implementation with paranoid mode, explicitly querying with `deletedAt: null` in the filter will return no results, even when matching non-deleted records exist. This differs from Sequelize's default behavior.

```typescript
// Will return no records, even when non-deleted records exist
const noResults = await repository.find({
  deletedAt: null,
  // other conditions...
})

// Will correctly return non-deleted records
const results = await repository.find({
  // other conditions only...
})
```

To query for records including their deletion status:

```typescript
// Query including soft-deleted records
const allRecords = await repository.find({}, { 
  paranoid: false 
})
```

## Pattern Matching Across Databases

### Issue: Inconsistent Pattern Matching Support

Different databases have varying levels of support for pattern matching operations:

1. **SQLite**
   - Primary pattern matching through LIKE with % wildcards
   - Case-sensitive by default
   - Limited regex support (requires custom build)
   - No direct support for REGEXP without extensions

2. **PostgreSQL**
   - Supports both LIKE and REGEXP/~ operators
   - Case-insensitive LIKE with ILIKE
   - Full regex support with ~ operator
   - Different regex syntax than MySQL

3. **MySQL**
   - Supports both LIKE and REGEXP operators
   - Case-insensitive LIKE by default
   - Built-in regex support
   - Different regex syntax than PostgreSQL

### Impact on Repository Interface

Our repository interface follows MongoDB-style operators, but database limitations create challenges:

1. **MongoDB-style `$regex`**
   - Requires RegExp object
   - Maps to Sequelize's `Op.regexp`
   - Not supported in SQLite without extensions
   - Different syntax across PostgreSQL and MySQL

2. **SQL-style `$like`**
   - Uses % wildcards
   - Maps to Sequelize's `Op.like`
   - Universally supported
   - Not a MongoDB operator

### Best Practices

1. **Pattern Matching in Tests**
   - Use `$like` for SQLite integration tests
   - Document that production may use `$regex` if supported
   - Consider database-specific test suites

2. **Production Considerations**
   - Check database regex support before using `$regex`
   - Use `$like` for universal compatibility
   - Document pattern matching limitations

3. **Interface Design**
   - Consider separating core and database-specific operators
   - Document operator support per database
   - Provide clear migration paths

### Example: Pattern Matching Behavior

```typescript
// SQLite (Integration Tests)
const results = await repository.find({
  field: { $like: 'test-%' }  // Uses % wildcard
});

// PostgreSQL/MySQL (Production)
const results = await repository.find({
  field: { $regex: /^test-/ }  // Uses regex pattern
});
```

### Recommendations

1. **Short-term**
   - Keep both `$regex` and `$like` operators
   - Document limitations in THINKING.md
   - Add database-specific tests

2. **Long-term**
   - Consider database-specific operator interfaces
   - Implement operator validation per dialect
   - Add migration utilities for pattern matching 

## Paranoid Mode Best Practices

1. Using Paranoid Mode
   - Let Sequelize handle soft delete behavior
   - Don't explicitly query `deletedAt` field
   - Use `paranoid: false` option to include soft-deleted records
   - Default behavior (`paranoid: true`) automatically excludes soft-deleted records

2. Recommended Patterns
   ```typescript
   // ✅ Recommended: Let paranoid mode handle soft deletes
   const activeRecords = await repository.find({});
   const allRecords = await repository.find({}, { paranoid: false });
   ```

3. Supported but Not Recommended
   ```typescript
   // ⚠️ Supported but not recommended:
   // Explicit deletedAt queries work but may interfere with paranoid mode
   const records = await repository.find({ 
     deletedAt: { $eq: null }  // Works but not recommended
   });
   ```

4. Why Avoid Explicit Queries?
   - May interfere with Sequelize's paranoid mode behavior
   - Makes code more complex than necessary
   - Harder to maintain consistency
   - May cause unexpected behavior with transactions

5. Soft Delete Operations
   - Use `softDelete()` methods for soft deletes
   - Use `delete()` methods for hard deletes
   - Use `restore()` methods to undelete soft-deleted records

6. Testing Considerations
   - Test default behavior (should exclude soft-deleted records)
   - Test with `paranoid: false` (should include soft-deleted records)
   - Test explicit queries if your codebase uses them
   - Document any explicit deletedAt queries as non-recommended 