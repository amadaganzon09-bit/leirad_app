# Project Structure

This project uses Supabase as the backend for data persistence and follows a clean, component-based architecture.

## Architecture Overview

The application is organized into logical layers:
- **Components**: UI components organized by feature
- **Types**: TypeScript type definitions
- **Constants**: Shared constants and configurations
- **Utils**: Utility functions and API layer

## Directory Structure

```
leirad_app-main/
├── components/
│   ├── budget/                    # Budget feature components
│   │   ├── BudgetOverview.tsx    # Dashboard view
│   │   ├── TransactionList.tsx   # Transaction management
│   │   ├── BudgetList.tsx        # Budget management
│   │   ├── GoalList.tsx          # Savings goals
│   │   ├── WalletList.tsx        # Wallet management
│   │   └── Modals/               # Modal dialogs
│   │       ├── AddTransactionModal.tsx
│   │       ├── AddBudgetModal.tsx
│   │       ├── AddGoalModal.tsx
│   │       └── AddWalletModal.tsx
│   ├── BudgetTracker.tsx         # Main budget container
│   ├── TodoList.tsx              # Task management
│   ├── ConfirmModal.tsx          # Reusable confirmation dialog
│   └── LoadingSpinner.tsx        # Loading indicator
├── types/
│   ├── budget.ts                 # Budget-related types
│   └── index.ts                  # General types
├── constants/
│   └── budget.tsx                # Budget constants (categories, icons)
├── utils/
│   └── api.ts                    # Supabase API layer
├── App.tsx                       # Main application
├── index.tsx                     # Entry point
└── docs/
    ├── PROJECT_STRUCTURE.md      # This file
    ├── BUDGET_TRACKER_ARCHITECTURE.md  # Detailed architecture docs
    └── supabase_schema.sql       # Database schema
```

## Supabase Integration

All data operations (CRUD) are handled through the centralized API layer in `utils/api.ts`.

### Database Tables
- `users`: User authentication and profiles
- `todos`: Task management
- `budgets`: Budget allocations with category and limits
- `transactions`: Financial transactions with wallet associations
- `wallets`: Payment methods (cash, debit, credit, digital)
- `goals`: Savings goals with target amounts and deadlines

## Component Architecture

### Container Components
- **BudgetTracker.tsx**: Main container managing state and business logic
- **App.tsx**: Application state and routing

### Presentational Components
Located in `components/budget/`:
- Display-only components that receive data via props
- No direct API calls or complex state management
- Focused on UI rendering and user interactions

### Modal Components
Located in `components/budget/Modals/`:
- Self-contained form components
- Handle their own form state
- Communicate via callbacks to parent

## Design Patterns

### 1. Separation of Concerns
- **Data Layer**: `utils/api.ts` handles all database operations
- **Business Logic**: Container components manage state and orchestrate operations
- **Presentation**: Display components focus on UI rendering

### 2. Component Composition
- Small, focused components with single responsibilities
- Reusable components across features
- Clear prop interfaces with TypeScript

### 3. Type Safety
- Comprehensive TypeScript types in `types/` directory
- Strict type checking enabled
- Interfaces for all data structures

### 4. State Management
- React hooks for local state
- Props for component communication
- Centralized data fetching in containers

## Code Organization Best Practices

### File Naming
- PascalCase for component files: `BudgetTracker.tsx`
- camelCase for utility files: `api.ts`
- Descriptive names indicating purpose

### Component Structure
```typescript
// 1. Imports
import React from 'react';
import { ComponentProps } from '../types';

// 2. Interface definitions
interface MyComponentProps {
  // ...
}

// 3. Component definition
const MyComponent: React.FC<MyComponentProps> = (props) => {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
  return (/* JSX */);
};

// 7. Export
export default MyComponent;
```

## Development Workflow

### Adding New Features
1. Define types in `types/` directory
2. Add API functions in `utils/api.ts`
3. Create display components in appropriate feature folder
4. Create modal components if needed
5. Update container component with handlers
6. Test thoroughly

### Modifying Existing Features
1. Identify responsible component
2. Update types if data structure changes
3. Update API layer if backend changes
4. Update affected components
5. Test all related functionality

## Performance Considerations

- Efficient re-renders with proper React keys
- Minimal prop drilling through component composition
- Optimized list rendering
- Loading states to improve perceived performance

## Future Improvements

See `BUDGET_TRACKER_ARCHITECTURE.md` for detailed enhancement suggestions.
