# Budget Tracker Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BudgetTracker.tsx                           │
│                     (Main Container Component)                      │
│                                                                     │
│  State Management:                                                  │
│  • transactions, budgets, goals, wallets                           │
│  • loading states (isLoading, isSaving, isDeleting)                │
│  • modal states (isAddingTransaction, isAddingBudget, etc.)        │
│                                                                     │
│  Business Logic:                                                    │
│  • loadData() - Fetch all data from Supabase                       │
│  • handleAddTransaction() - Create new transaction                 │
│  • handleDeleteTransaction() - Remove transaction                  │
│  • handleSaveBudget() - Create/update budget                       │
│  • handleDeleteBudget() - Remove budget                            │
│  • handleAddGoal() - Create new goal                               │
│  • handleContributeGoal() - Add to goal savings                    │
│  • handleAddWallet() - Create new wallet                           │
│  • handleDeleteWallet() - Remove wallet                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
        │  Tab Navigation │ │  Tab Content│ │   Modals    │
        └─────────────────┘ └─────────────┘ └─────────────┘
                                    │               │
            ┌───────────────────────┼───────────────┼───────────────┐
            │           │           │           │           │       │
            ▼           ▼           ▼           ▼           ▼       ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Overview │ │Transaction│ │ Budgets  │ │  Goals   │ │ Wallets  │
    │   Tab    │ │   Tab     │ │   Tab    │ │   Tab    │ │   Tab    │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
         │            │            │            │            │
         ▼            ▼            ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Budget   │ │Transaction│ │ Budget   │ │  Goal    │ │ Wallet   │
    │ Overview │ │   List    │ │  List    │ │  List    │ │  List    │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                          Modal Components                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ AddTransaction   │  │   AddBudget      │  │    AddGoal       │ │
│  │     Modal        │  │     Modal        │  │     Modal        │ │
│  │                  │  │                  │  │                  │ │
│  │ • Type toggle    │  │ • Category select│  │ • Name input     │ │
│  │ • Amount input   │  │ • Limit input    │  │ • Target amount  │ │
│  │ • Category select│  │ • Edit mode      │  │ • Deadline       │ │
│  │ • Description    │  │                  │  │                  │ │
│  │ • Wallet select  │  │                  │  │                  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐                       │
│  │   AddWallet      │  │  ConfirmModal    │                       │
│  │     Modal        │  │  (Reusable)      │                       │
│  │                  │  │                  │                       │
│  │ • Name input     │  │ • Title          │                       │
│  │ • Type select    │  │ • Message        │                       │
│  │ • Initial balance│  │ • Confirm/Cancel │                       │
│  └──────────────────┘  └──────────────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                        Data Flow Architecture                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Interaction                                                  │
│         │                                                           │
│         ▼                                                           │
│   Component Event Handler                                          │
│         │                                                           │
│         ▼                                                           │
│   BudgetTracker Handler Function                                   │
│         │                                                           │
│         ▼                                                           │
│   utils/api.ts Function                                            │
│         │                                                           │
│         ▼                                                           │
│   Supabase Database                                                │
│         │                                                           │
│         ▼                                                           │
│   Response / Error                                                 │
│         │                                                           │
│         ▼                                                           │
│   loadData() - Refresh all data                                    │
│         │                                                           │
│         ▼                                                           │
│   State Update (setBudgets, setTransactions, etc.)                 │
│         │                                                           │
│         ▼                                                           │
│   Component Re-render                                              │
│         │                                                           │
│         ▼                                                           │
│   Toast Notification (Success/Error)                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      Type System Architecture                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  types/budget.ts                                                    │
│  ├── Transaction                                                    │
│  │   ├── id: string                                                │
│  │   ├── type: 'income' | 'expense' | 'transfer'                   │
│  │   ├── amount: number                                            │
│  │   ├── category: string                                          │
│  │   ├── description: string                                       │
│  │   ├── date: string                                              │
│  │   ├── walletId: string                                          │
│  │   └── tags: string[]                                            │
│  │                                                                  │
│  ├── Budget                                                         │
│  │   ├── id: string                                                │
│  │   ├── category: string                                          │
│  │   ├── limit: number                                             │
│  │   ├── spent: number                                             │
│  │   ├── period: 'monthly' | 'weekly'                              │
│  │   ├── icon: React.ReactNode                                     │
│  │   └── color: string                                             │
│  │                                                                  │
│  ├── Goal                                                           │
│  │   ├── id: string                                                │
│  │   ├── name: string                                              │
│  │   ├── targetAmount: number                                      │
│  │   ├── savedAmount: number                                       │
│  │   ├── deadline: string                                          │
│  │   └── color: string                                             │
│  │                                                                  │
│  └── WalletType                                                     │
│      ├── id: string                                                │
│      ├── name: string                                              │
│      ├── type: 'cash' | 'debit' | 'credit' | 'digital'             │
│      ├── balance: number                                           │
│      ├── color: string                                             │
│      └── icon: React.ReactNode                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                    Constants & Shared Resources                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  constants/budget.tsx                                               │
│  ├── CATEGORIES                                                     │
│  │   ├── Food (Utensils icon, orange)                              │
│  │   ├── Transport (Car icon, blue)                                │
│  │   ├── Shopping (ShoppingBag icon, pink)                         │
│  │   ├── Entertainment (Film icon, purple)                         │
│  │   ├── Health (Heart icon, red)                                  │
│  │   ├── Housing (Home icon, indigo)                               │
│  │   ├── Coffee (Coffee icon, amber)                               │
│  │   ├── Bills (Receipt icon, slate)                               │
│  │   ├── Groceries (ShoppingBag icon, emerald)                     │
│  │   └── Other (DollarSign icon, slate)                            │
│  │                                                                  │
│  └── WALLET_ICONS                                                   │
│      ├── cash: Banknote icon                                       │
│      ├── debit: CreditCard icon                                    │
│      ├── credit: CreditCard icon                                   │
│      └── digital: Smartphone icon                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      Component Relationships                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  BudgetTracker (Container)                                          │
│    │                                                                │
│    ├─► BudgetOverview                                              │
│    │     Props: transactions, wallets, budgets, goals              │
│    │                                                                │
│    ├─► TransactionList                                             │
│    │     Props: transactions, wallets, onDelete                    │
│    │                                                                │
│    ├─► BudgetList                                                  │
│    │     Props: budgets, onEdit, onDelete, onCreate                │
│    │                                                                │
│    ├─► GoalList                                                    │
│    │     Props: goals, onContribute, onDelete, onCreate            │
│    │                                                                │
│    ├─► WalletList                                                  │
│    │     Props: wallets, onDelete, onCreate                        │
│    │                                                                │
│    ├─► AddTransactionModal                                         │
│    │     Props: isOpen, onClose, onAdd, wallets, isLoading         │
│    │                                                                │
│    ├─► AddBudgetModal                                              │
│    │     Props: isOpen, onClose, onSave, editingBudget, isLoading  │
│    │                                                                │
│    ├─► AddGoalModal                                                │
│    │     Props: isOpen, onClose, onAdd                             │
│    │                                                                │
│    ├─► AddWalletModal                                              │
│    │     Props: isOpen, onClose, onAdd                             │
│    │                                                                │
│    └─► ConfirmModal                                                │
│          Props: isOpen, onClose, onConfirm, title, message         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Key Benefits of This Architecture

### 1. **Modularity**
Each component is independent and can be modified without affecting others.

### 2. **Reusability**
Components can be reused across different parts of the application.

### 3. **Testability**
Small, focused components are easier to unit test.

### 4. **Maintainability**
Clear separation makes it easy to find and fix issues.

### 5. **Scalability**
New features can be added without restructuring existing code.

### 6. **Type Safety**
TypeScript ensures data consistency across components.

### 7. **Performance**
Optimized re-renders through proper component structure.
