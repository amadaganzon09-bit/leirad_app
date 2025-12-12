# Budget Tracker - Quick Reference Guide

## 🚀 Quick Start

### Running the Application
```bash
npm run dev     # Start development server
npm run build   # Build for production
```

### File Locations
- **Main Container**: `components/BudgetTracker.tsx`
- **Display Components**: `components/budget/*.tsx`
- **Modal Components**: `components/budget/Modals/*.tsx`
- **Types**: `types/budget.ts`
- **Constants**: `constants/budget.tsx`
- **API Layer**: `utils/api.ts`

## 📋 Common Tasks

### Adding a New Transaction Category

1. **Update constants** (`constants/budget.tsx`):
```typescript
export const CATEGORIES = [
  // ... existing categories
  { 
    name: 'NewCategory', 
    icon: <IconName className="w-4 h-4" />, 
    color: 'bg-color-500' 
  }
];
```

2. **Import the icon** at the top of the file:
```typescript
import { IconName } from 'lucide-react';
```

### Adding a New Wallet Type

1. **Update type definition** (`types/budget.ts`):
```typescript
export interface WalletType {
  type: 'cash' | 'debit' | 'credit' | 'digital' | 'new-type';
  // ... other fields
}
```

2. **Update wallet icons** (`constants/budget.tsx`):
```typescript
export const WALLET_ICONS = {
  // ... existing types
  'new-type': <IconName className="w-5 h-5" />
};
```

3. **Update AddWalletModal** (`components/budget/Modals/AddWalletModal.tsx`):
```typescript
{(['cash', 'debit', 'credit', 'digital', 'new-type'] as const).map((t) => (
  // ... button rendering
))}
```

### Creating a New Modal

1. **Create file**: `components/budget/Modals/YourModal.tsx`

2. **Use this template**:
```typescript
import React, { useState } from 'react';
import { X, IconName } from 'lucide-react';

interface YourModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

const YourModal: React.FC<YourModalProps> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({});

    const handleSubmit = async () => {
        await onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800">Modal Title</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Form fields here */}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100">
                    <button onClick={handleSubmit} className="w-full py-3 bg-indigo-600 text-white rounded-xl">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YourModal;
```

3. **Import and use in BudgetTracker**:
```typescript
import YourModal from './budget/Modals/YourModal';

// In component:
const [isYourModalOpen, setIsYourModalOpen] = useState(false);

// In JSX:
<YourModal 
    isOpen={isYourModalOpen}
    onClose={() => setIsYourModalOpen(false)}
    onSave={handleYourModalSave}
/>
```

### Adding a New API Function

1. **Add to utils/api.ts**:
```typescript
export const api = {
  // ... existing functions
  
  async yourNewFunction(param1: string, param2: any) {
    const { data, error } = await supabase
      .from('your_table')
      .insert([{ /* your data */ }]);
    
    if (error) throw error;
    return data;
  }
};
```

2. **Use in BudgetTracker**:
```typescript
const handleYourAction = async () => {
  try {
    await api.yourNewFunction(param1, param2);
    await loadData();
    addToast('Success!', ToastType.SUCCESS);
  } catch (error: any) {
    addToast(error.message, ToastType.ERROR);
  }
};
```

## 🎨 Styling Guidelines

### Color Palette
- **Primary**: `indigo-600` (buttons, active states)
- **Success**: `emerald-600` (income, success messages)
- **Error**: `rose-600` (expenses, errors)
- **Warning**: `amber-600` (warnings, near-limit)
- **Neutral**: `slate-*` (text, borders, backgrounds)

### Common Classes
```css
/* Buttons */
.primary-button: bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2

/* Cards */
.card: bg-white rounded-2xl p-4 border border-slate-100 shadow-sm

/* Inputs */
.input: w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500

/* Modal Overlay */
.modal-overlay: fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm
```

## 🔍 Debugging Tips

### Check Data Flow
1. **Console log in handler**: See what data is being sent
2. **Check API response**: Verify Supabase returns data
3. **Inspect state**: Use React DevTools to check state updates
4. **Check loadData()**: Ensure data is being fetched correctly

### Common Issues

**Issue**: Modal not closing after save
```typescript
// Solution: Make sure onClose() is called after successful save
const handleSave = async () => {
  await onSave(data);
  onClose(); // ← Add this
};
```

**Issue**: Data not updating after action
```typescript
// Solution: Call loadData() after API operations
await api.addTransaction(...);
await loadData(); // ← Add this
```

**Issue**: TypeScript errors on props
```typescript
// Solution: Define proper interface
interface MyComponentProps {
  data: YourType[];  // Use proper type from types/budget.ts
  onAction: (id: string) => void;
}
```

## 📊 State Management

### Current State Structure
```typescript
// Data States
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [budgets, setBudgets] = useState<Budget[]>([]);
const [goals, setGoals] = useState<Goal[]>([]);
const [wallets, setWallets] = useState<WalletType[]>([]);

// Loading States
const [isLoading, setIsLoading] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// Modal States
const [isAddingTransaction, setIsAddingTransaction] = useState(false);
const [isAddingBudget, setIsAddingBudget] = useState(false);
const [isAddingGoal, setIsAddingGoal] = useState(false);
const [isAddingWallet, setIsAddingWallet] = useState(false);
```

### Loading State Pattern
```typescript
const handleAction = async () => {
  setIsSaving(true);
  try {
    await api.someAction();
    await loadData();
    addToast('Success!', ToastType.SUCCESS);
  } catch (error: any) {
    addToast(error.message, ToastType.ERROR);
  } finally {
    setIsSaving(false); // Always reset in finally
  }
};
```

## 🧪 Testing Checklist

### Before Committing
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] All CRUD operations work
- [ ] Empty states display correctly
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Mobile responsive
- [ ] Desktop navigation works

### Manual Testing Flow
1. **Transactions**: Add, filter, search, delete
2. **Budgets**: Create, edit, delete, check progress
3. **Goals**: Create, contribute, complete, delete
4. **Wallets**: Add, view balance, delete
5. **Overview**: Verify all stats are correct

## 📚 Additional Resources

- **Architecture Details**: `BUDGET_TRACKER_ARCHITECTURE.md`
- **Visual Diagrams**: `ARCHITECTURE_DIAGRAM.md`
- **Refactoring Summary**: `REFACTORING_SUMMARY.md`
- **Project Structure**: `PROJECT_STRUCTURE.md`

## 🆘 Getting Help

### Common Questions

**Q: Where do I add a new feature?**
A: Start with types → API → component → modal → handler

**Q: How do I modify existing UI?**
A: Find the display component in `components/budget/` and edit

**Q: Where are the icons from?**
A: [Lucide React](https://lucide.dev/) - import from `lucide-react`

**Q: How do I change colors?**
A: Use Tailwind classes, see styling guidelines above

**Q: Where is the database schema?**
A: Check `utils/api.ts` for table structure and operations

## 💡 Pro Tips

1. **Use TypeScript**: Let types guide you - if it compiles, it usually works
2. **Follow patterns**: Copy existing components as templates
3. **Keep components small**: If > 200 lines, consider splitting
4. **Test incrementally**: Don't write everything before testing
5. **Use React DevTools**: Inspect props and state easily
6. **Console.log strategically**: Debug data flow step by step
7. **Read error messages**: TypeScript errors are usually helpful

---

**Last Updated**: November 21, 2025
**Version**: 2.0 (Post-Refactor)
