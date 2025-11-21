# Database Field Mapping Guide

## Overview
The application uses **camelCase** in JavaScript/TypeScript code but **snake_case** in the Supabase database. This document explains the field mappings to prevent errors.

## Field Name Conventions

### JavaScript/TypeScript (Frontend)
- Use **camelCase**: `walletId`, `targetAmount`, `savedAmount`

### Supabase Database (Backend)
- Use **snake_case**: `wallet_id`, `target_amount`, `saved_amount`

## Table Field Mappings

### 1. Transactions Table

| Frontend (camelCase) | Database (snake_case) | Type | Description |
|---------------------|----------------------|------|-------------|
| `id` | `id` | string | Unique identifier |
| `type` | `type` | string | 'income' or 'expense' |
| `amount` | `amount` | number | Transaction amount |
| `category` | `category` | string | Category name |
| `description` | `description` | string | Transaction description |
| `date` | `date` | string | ISO date string |
| `walletId` | `wallet_id` | string | Associated wallet ID |
| `tags` | `tags` | string[] | Optional tags |

### 2. Budgets Table

| Frontend (camelCase) | Database (snake_case) | Type | Description |
|---------------------|----------------------|------|-------------|
| `id` | `id` | string | Unique identifier |
| `category` | `category` | string | Budget category |
| `limit` | `limit_amount` | number | Budget limit |
| `spent` | `spent` | number | Amount spent |
| `period` | `period` | string | 'monthly' or 'weekly' |

### 3. Goals Table

| Frontend (camelCase) | Database (snake_case) | Type | Description |
|---------------------|----------------------|------|-------------|
| `id` | `id` | string | Unique identifier |
| `name` | `name` | string | Goal name |
| `targetAmount` | `target_amount` | number | Target amount |
| `savedAmount` | `saved_amount` | number | Amount saved |
| `deadline` | `deadline` | string | Deadline date |
| `color` | `color` | string | Color class |

### 4. Wallets Table

| Frontend (camelCase) | Database (snake_case) | Type | Description |
|---------------------|----------------------|------|-------------|
| `id` | `id` | string | Unique identifier |
| `name` | `name` | string | Wallet name |
| `type` | `type` | string | Wallet type |
| `balance` | `balance` | number | Current balance |
| `color` | `color` | string | Color class |

## Implementation Pattern

### When Sending Data to Database (Write Operations)

Always convert camelCase to snake_case:

```typescript
// ❌ WRONG - Will cause "column not found" error
await api.addTransaction(username, {
    walletId: data.walletId,  // Database doesn't recognize this
    targetAmount: data.target
});

// ✅ CORRECT - Convert to snake_case
await api.addTransaction(username, {
    wallet_id: data.walletId,     // Converted to snake_case
    target_amount: data.target
});
```

### When Reading Data from Database (Read Operations)

Always convert snake_case to camelCase:

```typescript
// In loadData() or similar functions
setTransactions(transactionsData.map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    walletId: t.wallet_id,        // ✅ Convert to camelCase
    tags: t.tags || []
})));

setGoals(goalsData.map((g: any) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.target_amount,    // ✅ Convert to camelCase
    savedAmount: g.saved_amount,      // ✅ Convert to camelCase
    deadline: g.deadline,
    color: g.color || 'bg-indigo-500'
})));
```

## Example: Adding a Transaction

### Step 1: Modal Component (camelCase)
```typescript
// AddTransactionModal.tsx
const handleSubmit = async () => {
    await onAdd({
        type,
        amount: parseFloat(amount),
        category,
        description,
        walletId,  // ← camelCase in component
        date: new Date().toISOString()
    });
};
```

### Step 2: Handler in BudgetTracker (Convert to snake_case)
```typescript
// BudgetTracker.tsx
const handleAddTransaction = async (data: any) => {
    await api.addTransaction(username, {
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date,
        wallet_id: data.walletId,  // ← Convert to snake_case
        tags: []
    });
};
```

### Step 3: API Layer (Use snake_case)
```typescript
// utils/api.ts
addTransaction: async (username: string, transaction: any) => {
    const { data, error } = await supabase
        .from('transactions')
        .insert([{ 
            ...transaction,  // Already in snake_case
            username 
        }])
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data;
}
```

### Step 4: Reading Back (Convert to camelCase)
```typescript
// BudgetTracker.tsx - loadData()
setTransactions(transactionsData.map((t: any) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    walletId: t.wallet_id,  // ← Convert back to camelCase
    tags: t.tags || []
})));
```

## Common Errors and Solutions

### Error: "Could not find the 'walletId' column"
**Cause**: Trying to insert camelCase field name into database
**Solution**: Convert to snake_case before sending to API

```typescript
// ❌ WRONG
await api.addTransaction(username, { walletId: '123' });

// ✅ CORRECT
await api.addTransaction(username, { wallet_id: '123' });
```

### Error: "Property 'walletId' does not exist"
**Cause**: Forgot to convert snake_case to camelCase when reading
**Solution**: Map database fields to camelCase

```typescript
// ❌ WRONG
setTransactions(data.map(t => ({
    ...t  // Contains wallet_id, not walletId
})));

// ✅ CORRECT
setTransactions(data.map(t => ({
    id: t.id,
    walletId: t.wallet_id  // Convert to camelCase
})));
```

## Best Practices

### 1. Always Use Explicit Mapping
Don't use spread operators when converting between formats:
```typescript
// ❌ AVOID - Loses control over field names
await api.addTransaction(username, { ...data });

// ✅ PREFER - Explicit field mapping
await api.addTransaction(username, {
    type: data.type,
    amount: data.amount,
    wallet_id: data.walletId  // Clear conversion
});
```

### 2. Create Type-Safe Interfaces
Define separate interfaces for database and frontend:
```typescript
// Frontend interface (camelCase)
interface Transaction {
    id: string;
    walletId: string;
    targetAmount: number;
}

// Database interface (snake_case)
interface TransactionDB {
    id: string;
    wallet_id: string;
    target_amount: number;
}
```

### 3. Centralize Conversion Logic
Consider creating helper functions:
```typescript
// utils/converters.ts
export const toSnakeCase = (obj: any) => {
    // Convert object keys to snake_case
};

export const toCamelCase = (obj: any) => {
    // Convert object keys to camelCase
};
```

## Quick Reference

### Fields That Need Conversion

**Always convert these:**
- `walletId` ↔ `wallet_id`
- `targetAmount` ↔ `target_amount`
- `savedAmount` ↔ `saved_amount`
- `limitAmount` ↔ `limit_amount`
- `createdAt` ↔ `created_at`

**No conversion needed:**
- `id`, `type`, `amount`, `category`, `description`, `date`
- `name`, `balance`, `color`, `period`
- `username`, `spent`, `deadline`, `tags`

## Testing Checklist

When adding new database operations:
- [ ] Verify field names in Supabase schema
- [ ] Convert camelCase to snake_case when writing
- [ ] Convert snake_case to camelCase when reading
- [ ] Test create operation
- [ ] Test read operation
- [ ] Test update operation
- [ ] Check browser console for errors
- [ ] Verify data appears correctly in UI

---

**Last Updated**: November 21, 2025
**Status**: ✅ All mappings verified and working
