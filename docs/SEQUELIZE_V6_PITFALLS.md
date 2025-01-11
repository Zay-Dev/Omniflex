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