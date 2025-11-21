// Offline-capable API wrapper
import { api } from './api';
import { offlineStorage } from './offlineStorage';
import { Todo, Priority, Category } from '../types';

// Type definitions for offline operations
type OperationType = 'add_todo' | 'update_todo' | 'delete_todo' | 'bulk_delete' | 'bulk_update' | 
                    'add_budget' | 'update_budget' | 'delete_budget' |
                    'add_transaction' | 'update_transaction' | 'delete_transaction' |
                    'add_wallet' | 'update_wallet' | 'delete_wallet' |
                    'add_goal' | 'update_goal' | 'delete_goal';

interface PendingOperation {
  id: string;
  type: OperationType;
  data: any;
  timestamp: number;
}

// Network status tracking
let isOnline = navigator.onLine;
window.addEventListener('online', () => {
  isOnline = true;
  syncPendingOperations();
});
window.addEventListener('offline', () => {
  isOnline = false;
});

// Check if we're online
const checkOnlineStatus = (): boolean => {
  return isOnline;
};

// Sync pending operations when coming back online
const syncPendingOperations = async () => {
  const user = localStorage.getItem('leiradmaster-current-user');
  if (!user) return;

  const pendingOps = offlineStorage.getPendingOperations(user);
  if (pendingOps.length === 0) return;

  console.log(`Syncing ${pendingOps.length} pending operations...`);

  // Process operations in order
  for (const op of pendingOps) {
    try {
      await processPendingOperation(op, user);
      // Remove successful operation
      const updatedOps = offlineStorage.getPendingOperations(user).filter((o: any) => o.id !== op.id);
      offlineStorage.store(`pending_ops_${user}`, updatedOps);
    } catch (error) {
      console.error('Failed to sync operation:', op, error);
    }
  }
};

// Process a single pending operation
const processPendingOperation = async (op: PendingOperation, username: string) => {
  switch (op.type) {
    case 'add_todo':
      return await api.addTodo(username, op.data.text, op.data.dueDate, op.data.priority, op.data.category);
    case 'update_todo':
      return await api.updateTodo(op.data.id, op.data.updates);
    case 'delete_todo':
      return await api.deleteTodo(op.data.id);
    case 'bulk_delete':
      return await api.bulkDelete(op.data.ids);
    case 'bulk_update':
      return await api.bulkUpdate(op.data.ids, op.data.updates);
    case 'add_budget':
      return await api.addBudget(username, op.data.category, op.data.limit, op.data.period);
    case 'update_budget':
      return await api.updateBudget(op.data.id, op.data.updates);
    case 'delete_budget':
      return await api.deleteBudget(op.data.id);
    case 'add_transaction':
      return await api.addTransaction(username, op.data.transaction);
    case 'update_transaction':
      return await api.updateTransaction(op.data.id, op.data.updates);
    case 'delete_transaction':
      return await api.deleteTransaction(op.data.id);
    case 'add_wallet':
      return await api.addWallet(username, op.data.wallet);
    case 'update_wallet':
      return await api.updateWallet(op.data.id, op.data.updates);
    case 'delete_wallet':
      return await api.deleteWallet(op.data.id);
    case 'add_goal':
      return await api.addGoal(username, op.data.goal);
    case 'update_goal':
      return await api.updateGoal(op.data.id, op.data.updates);
    case 'delete_goal':
      return await api.deleteGoal(op.data.id);
    default:
      throw new Error(`Unknown operation type: ${op.type}`);
  }
};

// Offline API wrapper
export const offlineApi = {
  // --- TODOS ---
  getTodos: async (username: string): Promise<Todo[]> => {
    if (checkOnlineStatus()) {
      try {
        const todos = await api.getTodos(username);
        // Cache the todos locally
        offlineStorage.store(`todos_${username}`, todos);
        return todos;
      } catch (error) {
        // If online fails, try to get from cache
        const cached = offlineStorage.retrieve(`todos_${username}`);
        if (cached) return cached;
        throw error;
      }
    } else {
      // Offline - get from cache
      const cached = offlineStorage.retrieve(`todos_${username}`);
      return cached || [];
    }
  },

  addTodo: async (username: string, text: string, dueDate: number | undefined, priority: Priority, category: Category): Promise<Todo> => {
    const newTodo: Todo = {
      id: offlineStorage.generateId(),
      text,
      completed: false,
      createdAt: Date.now(),
      dueDate,
      priority,
      category
    };

    if (checkOnlineStatus()) {
      try {
        // Try to save online
        const savedTodo = await api.addTodo(username, text, dueDate, priority, category);
        // Update local cache
        const todos = await offlineApi.getTodos(username);
        offlineStorage.store(`todos_${username}`, [savedTodo, ...todos]);
        return savedTodo;
      } catch (error) {
        // Online failed - store locally and queue for sync
        const todos = await offlineApi.getTodos(username);
        offlineStorage.store(`todos_${username}`, [newTodo, ...todos]);
        offlineStorage.storePendingOperation(username, {
          type: 'add_todo',
          data: { text, dueDate, priority, category }
        });
        return newTodo;
      }
    } else {
      // Offline - store locally and queue for sync
      const todos = await offlineApi.getTodos(username);
      offlineStorage.store(`todos_${username}`, [newTodo, ...todos]);
      offlineStorage.storePendingOperation(username, {
        type: 'add_todo',
        data: { text, dueDate, priority, category }
      });
      return newTodo;
    }
  },

  updateTodo: async (username: string, id: string, updates: Partial<Todo>) => {
    if (checkOnlineStatus()) {
      try {
        // Try to update online
        await api.updateTodo(id, updates);
        // Update local cache
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.map((todo: Todo) => 
          todo.id === id ? { ...todo, ...updates } : todo
        );
        offlineStorage.store(`todos_${username}`, updatedTodos);
        return { message: 'Updated successfully' };
      } catch (error) {
        // Online failed - store locally and queue for sync
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.map((todo: Todo) => 
          todo.id === id ? { ...todo, ...updates } : todo
        );
        offlineStorage.store(`todos_${username}`, updatedTodos);
        offlineStorage.storePendingOperation(username, {
          type: 'update_todo',
          data: { id, updates }
        });
        return { message: 'Updated locally, will sync when online' };
      }
    } else {
      // Offline - store locally and queue for sync
      const todos = await offlineApi.getTodos(username);
      const updatedTodos = todos.map((todo: Todo) => 
        todo.id === id ? { ...todo, ...updates } : todo
      );
      offlineStorage.store(`todos_${username}`, updatedTodos);
      offlineStorage.storePendingOperation(username, {
        type: 'update_todo',
        data: { id, updates }
      });
      return { message: 'Updated locally, will sync when online' };
    }
  },

  deleteTodo: async (username: string, id: string) => {
    if (checkOnlineStatus()) {
      try {
        // Try to delete online
        await api.deleteTodo(id);
        // Update local cache
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.filter((todo: Todo) => todo.id !== id);
        offlineStorage.store(`todos_${username}`, updatedTodos);
        return { message: 'Deleted successfully' };
      } catch (error) {
        // Online failed - store locally and queue for sync
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.filter((todo: Todo) => todo.id !== id);
        offlineStorage.store(`todos_${username}`, updatedTodos);
        offlineStorage.storePendingOperation(username, {
          type: 'delete_todo',
          data: { id }
        });
        return { message: 'Deleted locally, will sync when online' };
      }
    } else {
      // Offline - store locally and queue for sync
      const todos = await offlineApi.getTodos(username);
      const updatedTodos = todos.filter((todo: Todo) => todo.id !== id);
      offlineStorage.store(`todos_${username}`, updatedTodos);
      offlineStorage.storePendingOperation(username, {
        type: 'delete_todo',
        data: { id }
      });
      return { message: 'Deleted locally, will sync when online' };
    }
  },

  bulkDelete: async (username: string, ids: string[]) => {
    if (checkOnlineStatus()) {
      try {
        // Try to delete online
        await api.bulkDelete(ids);
        // Update local cache
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.filter((todo: Todo) => !ids.includes(todo.id));
        offlineStorage.store(`todos_${username}`, updatedTodos);
        return { message: 'Bulk delete successful' };
      } catch (error) {
        // Online failed - store locally and queue for sync
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.filter((todo: Todo) => !ids.includes(todo.id));
        offlineStorage.store(`todos_${username}`, updatedTodos);
        offlineStorage.storePendingOperation(username, {
          type: 'bulk_delete',
          data: { ids }
        });
        return { message: 'Bulk deleted locally, will sync when online' };
      }
    } else {
      // Offline - store locally and queue for sync
      const todos = await offlineApi.getTodos(username);
      const updatedTodos = todos.filter((todo: Todo) => !ids.includes(todo.id));
      offlineStorage.store(`todos_${username}`, updatedTodos);
      offlineStorage.storePendingOperation(username, {
        type: 'bulk_delete',
        data: { ids }
      });
      return { message: 'Bulk deleted locally, will sync when online' };
    }
  },

  bulkUpdate: async (username: string, ids: string[], updates: Partial<Todo>) => {
    if (checkOnlineStatus()) {
      try {
        // Try to update online
        await api.bulkUpdate(ids, updates);
        // Update local cache
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.map((todo: Todo) => 
          ids.includes(todo.id) ? { ...todo, ...updates } : todo
        );
        offlineStorage.store(`todos_${username}`, updatedTodos);
        return { message: 'Bulk update successful' };
      } catch (error) {
        // Online failed - store locally and queue for sync
        const todos = await offlineApi.getTodos(username);
        const updatedTodos = todos.map((todo: Todo) => 
          ids.includes(todo.id) ? { ...todo, ...updates } : todo
        );
        offlineStorage.store(`todos_${username}`, updatedTodos);
        offlineStorage.storePendingOperation(username, {
          type: 'bulk_update',
          data: { ids, updates }
        });
        return { message: 'Bulk updated locally, will sync when online' };
      }
    } else {
      // Offline - store locally and queue for sync
      const todos = await offlineApi.getTodos(username);
      const updatedTodos = todos.map((todo: Todo) => 
        ids.includes(todo.id) ? { ...todo, ...updates } : todo
      );
      offlineStorage.store(`todos_${username}`, updatedTodos);
      offlineStorage.storePendingOperation(username, {
        type: 'bulk_update',
        data: { ids, updates }
      });
      return { message: 'Bulk updated locally, will sync when online' };
    }
  },

  // --- BUDGETS ---
  getBudgets: async (username: string) => {
    if (checkOnlineStatus()) {
      try {
        const budgets = await api.getBudgets(username);
        offlineStorage.store(`budgets_${username}`, budgets);
        return budgets;
      } catch (error) {
        const cached = offlineStorage.retrieve(`budgets_${username}`);
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = offlineStorage.retrieve(`budgets_${username}`);
      return cached || [];
    }
  },

  addBudget: async (username: string, category: string, limit: number, period: string = 'monthly') => {
    if (checkOnlineStatus()) {
      try {
        const budget = await api.addBudget(username, category, limit, period);
        const budgets = await offlineApi.getBudgets(username);
        offlineStorage.store(`budgets_${username}`, [budget, ...budgets]);
        return budget;
      } catch (error) {
        const newBudget = {
          id: offlineStorage.generateId(),
          username,
          category,
          limit_amount: limit,
          period,
          spent: 0,
          created_at: Date.now()
        };
        const budgets = await offlineApi.getBudgets(username);
        offlineStorage.store(`budgets_${username}`, [newBudget, ...budgets]);
        offlineStorage.storePendingOperation(username, {
          type: 'add_budget',
          data: { category, limit, period }
        });
        return newBudget;
      }
    } else {
      const newBudget = {
        id: offlineStorage.generateId(),
        username,
        category,
        limit_amount: limit,
        period,
        spent: 0,
        created_at: Date.now()
      };
      const budgets = await offlineApi.getBudgets(username);
      offlineStorage.store(`budgets_${username}`, [newBudget, ...budgets]);
      offlineStorage.storePendingOperation(username, {
        type: 'add_budget',
        data: { category, limit, period }
      });
      return newBudget;
    }
  },

  updateBudget: async (username: string, id: string, updates: { limit_amount?: number; spent?: number }) => {
    if (checkOnlineStatus()) {
      try {
        await api.updateBudget(id, updates);
        const budgets = await offlineApi.getBudgets(username);
        const updatedBudgets = budgets.map((budget: any) => 
          budget.id === id ? { ...budget, ...updates } : budget
        );
        offlineStorage.store(`budgets_${username}`, updatedBudgets);
        return { message: 'Budget updated successfully' };
      } catch (error) {
        const budgets = await offlineApi.getBudgets(username);
        const updatedBudgets = budgets.map((budget: any) => 
          budget.id === id ? { ...budget, ...updates } : budget
        );
        offlineStorage.store(`budgets_${username}`, updatedBudgets);
        offlineStorage.storePendingOperation(username, {
          type: 'update_budget',
          data: { id, updates }
        });
        return { message: 'Budget updated locally, will sync when online' };
      }
    } else {
      const budgets = await offlineApi.getBudgets(username);
      const updatedBudgets = budgets.map((budget: any) => 
        budget.id === id ? { ...budget, ...updates } : budget
      );
      offlineStorage.store(`budgets_${username}`, updatedBudgets);
      offlineStorage.storePendingOperation(username, {
        type: 'update_budget',
        data: { id, updates }
      });
      return { message: 'Budget updated locally, will sync when online' };
    }
  },

  deleteBudget: async (username: string, id: string) => {
    if (checkOnlineStatus()) {
      try {
        await api.deleteBudget(id);
        const budgets = await offlineApi.getBudgets(username);
        const updatedBudgets = budgets.filter((budget: any) => budget.id !== id);
        offlineStorage.store(`budgets_${username}`, updatedBudgets);
        return { message: 'Budget deleted successfully' };
      } catch (error) {
        const budgets = await offlineApi.getBudgets(username);
        const updatedBudgets = budgets.filter((budget: any) => budget.id !== id);
        offlineStorage.store(`budgets_${username}`, updatedBudgets);
        offlineStorage.storePendingOperation(username, {
          type: 'delete_budget',
          data: { id }
        });
        return { message: 'Budget deleted locally, will sync when online' };
      }
    } else {
      const budgets = await offlineApi.getBudgets(username);
      const updatedBudgets = budgets.filter((budget: any) => budget.id !== id);
      offlineStorage.store(`budgets_${username}`, updatedBudgets);
      offlineStorage.storePendingOperation(username, {
        type: 'delete_budget',
        data: { id }
      });
      return { message: 'Budget deleted locally, will sync when online' };
    }
  },

  // --- GOALS ---
  getGoals: async (username: string) => {
    if (checkOnlineStatus()) {
      try {
        const goals = await api.getGoals(username);
        offlineStorage.store(`goals_${username}`, goals);
        return goals;
      } catch (error) {
        const cached = offlineStorage.retrieve(`goals_${username}`);
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = offlineStorage.retrieve(`goals_${username}`);
      return cached || [];
    }
  },

  addGoal: async (username: string, goal: any) => {
    if (checkOnlineStatus()) {
      try {
        const newGoal = await api.addGoal(username, goal);
        const goals = await offlineApi.getGoals(username);
        offlineStorage.store(`goals_${username}`, [newGoal, ...goals]);
        return newGoal;
      } catch (error) {
        const newGoal = {
          id: offlineStorage.generateId(),
          ...goal,
          created_at: Date.now()
        };
        const goals = await offlineApi.getGoals(username);
        offlineStorage.store(`goals_${username}`, [newGoal, ...goals]);
        offlineStorage.storePendingOperation(username, {
          type: 'add_goal',
          data: { goal }
        });
        return newGoal;
      }
    } else {
      const newGoal = {
        id: offlineStorage.generateId(),
        ...goal,
        created_at: Date.now()
      };
      const goals = await offlineApi.getGoals(username);
      offlineStorage.store(`goals_${username}`, [newGoal, ...goals]);
      offlineStorage.storePendingOperation(username, {
        type: 'add_goal',
        data: { goal }
      });
      return newGoal;
    }
  },

  updateGoal: async (username: string, id: string, updates: any) => {
    if (checkOnlineStatus()) {
      try {
        await api.updateGoal(id, updates);
        const goals = await offlineApi.getGoals(username);
        const updatedGoals = goals.map((goal: any) => 
          goal.id === id ? { ...goal, ...updates } : goal
        );
        offlineStorage.store(`goals_${username}`, updatedGoals);
        return { message: 'Goal updated successfully' };
      } catch (error) {
        const goals = await offlineApi.getGoals(username);
        const updatedGoals = goals.map((goal: any) => 
          goal.id === id ? { ...goal, ...updates } : goal
        );
        offlineStorage.store(`goals_${username}`, updatedGoals);
        offlineStorage.storePendingOperation(username, {
          type: 'update_goal',
          data: { id, updates }
        });
        return { message: 'Goal updated locally, will sync when online' };
      }
    } else {
      const goals = await offlineApi.getGoals(username);
      const updatedGoals = goals.map((goal: any) => 
        goal.id === id ? { ...goal, ...updates } : goal
      );
      offlineStorage.store(`goals_${username}`, updatedGoals);
      offlineStorage.storePendingOperation(username, {
        type: 'update_goal',
        data: { id, updates }
      });
      return { message: 'Goal updated locally, will sync when online' };
    }
  },

  deleteGoal: async (username: string, id: string) => {
    if (checkOnlineStatus()) {
      try {
        await api.deleteGoal(id);
        const goals = await offlineApi.getGoals(username);
        const updatedGoals = goals.filter((goal: any) => goal.id !== id);
        offlineStorage.store(`goals_${username}`, updatedGoals);
        return { message: 'Goal deleted successfully' };
      } catch (error) {
        const goals = await offlineApi.getGoals(username);
        const updatedGoals = goals.filter((goal: any) => goal.id !== id);
        offlineStorage.store(`goals_${username}`, updatedGoals);
        offlineStorage.storePendingOperation(username, {
          type: 'delete_goal',
          data: { id }
        });
        return { message: 'Goal deleted locally, will sync when online' };
      }
    } else {
      const goals = await offlineApi.getGoals(username);
      const updatedGoals = goals.filter((goal: any) => goal.id !== id);
      offlineStorage.store(`goals_${username}`, updatedGoals);
      offlineStorage.storePendingOperation(username, {
        type: 'delete_goal',
        data: { id }
      });
      return { message: 'Goal deleted locally, will sync when online' };
    }
  },

  // --- WALLETS ---
  getWallets: async (username: string) => {
    if (checkOnlineStatus()) {
      try {
        const wallets = await api.getWallets(username);
        offlineStorage.store(`wallets_${username}`, wallets);
        return wallets;
      } catch (error) {
        const cached = offlineStorage.retrieve(`wallets_${username}`);
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = offlineStorage.retrieve(`wallets_${username}`);
      return cached || [];
    }
  },

  addWallet: async (username: string, wallet: any) => {
    if (checkOnlineStatus()) {
      try {
        const newWallet = await api.addWallet(username, wallet);
        const wallets = await offlineApi.getWallets(username);
        offlineStorage.store(`wallets_${username}`, [newWallet, ...wallets]);
        return newWallet;
      } catch (error) {
        const newWallet = {
          id: offlineStorage.generateId(),
          ...wallet,
          created_at: Date.now()
        };
        const wallets = await offlineApi.getWallets(username);
        offlineStorage.store(`wallets_${username}`, [newWallet, ...wallets]);
        offlineStorage.storePendingOperation(username, {
          type: 'add_wallet',
          data: { wallet }
        });
        return newWallet;
      }
    } else {
      const newWallet = {
        id: offlineStorage.generateId(),
        ...wallet,
        created_at: Date.now()
      };
      const wallets = await offlineApi.getWallets(username);
      offlineStorage.store(`wallets_${username}`, [newWallet, ...wallets]);
      offlineStorage.storePendingOperation(username, {
        type: 'add_wallet',
        data: { wallet }
      });
      return newWallet;
    }
  },

  updateWallet: async (username: string, id: string, updates: any) => {
    if (checkOnlineStatus()) {
      try {
        await api.updateWallet(id, updates);
        const wallets = await offlineApi.getWallets(username);
        const updatedWallets = wallets.map((wallet: any) => 
          wallet.id === id ? { ...wallet, ...updates } : wallet
        );
        offlineStorage.store(`wallets_${username}`, updatedWallets);
        return { message: 'Wallet updated successfully' };
      } catch (error) {
        const wallets = await offlineApi.getWallets(username);
        const updatedWallets = wallets.map((wallet: any) => 
          wallet.id === id ? { ...wallet, ...updates } : wallet
        );
        offlineStorage.store(`wallets_${username}`, updatedWallets);
        offlineStorage.storePendingOperation(username, {
          type: 'update_wallet',
          data: { id, updates }
        });
        return { message: 'Wallet updated locally, will sync when online' };
      }
    } else {
      const wallets = await offlineApi.getWallets(username);
      const updatedWallets = wallets.map((wallet: any) => 
        wallet.id === id ? { ...wallet, ...updates } : wallet
      );
      offlineStorage.store(`wallets_${username}`, updatedWallets);
      offlineStorage.storePendingOperation(username, {
        type: 'update_wallet',
        data: { id, updates }
      });
      return { message: 'Wallet updated locally, will sync when online' };
    }
  },

  deleteWallet: async (username: string, id: string) => {
    if (checkOnlineStatus()) {
      try {
        await api.deleteWallet(id);
        const wallets = await offlineApi.getWallets(username);
        const updatedWallets = wallets.filter((wallet: any) => wallet.id !== id);
        offlineStorage.store(`wallets_${username}`, updatedWallets);
        return { message: 'Wallet deleted successfully' };
      } catch (error) {
        const wallets = await offlineApi.getWallets(username);
        const updatedWallets = wallets.filter((wallet: any) => wallet.id !== id);
        offlineStorage.store(`wallets_${username}`, updatedWallets);
        offlineStorage.storePendingOperation(username, {
          type: 'delete_wallet',
          data: { id }
        });
        return { message: 'Wallet deleted locally, will sync when online' };
      }
    } else {
      const wallets = await offlineApi.getWallets(username);
      const updatedWallets = wallets.filter((wallet: any) => wallet.id !== id);
      offlineStorage.store(`wallets_${username}`, updatedWallets);
      offlineStorage.storePendingOperation(username, {
        type: 'delete_wallet',
        data: { id }
      });
      return { message: 'Wallet deleted locally, will sync when online' };
    }
  },

  // --- TRANSACTIONS ---
  getTransactions: async (username: string) => {
    if (checkOnlineStatus()) {
      try {
        const transactions = await api.getTransactions(username);
        offlineStorage.store(`transactions_${username}`, transactions);
        return transactions;
      } catch (error) {
        const cached = offlineStorage.retrieve(`transactions_${username}`);
        if (cached) return cached;
        throw error;
      }
    } else {
      const cached = offlineStorage.retrieve(`transactions_${username}`);
      return cached || [];
    }
  },

  addTransaction: async (username: string, transaction: any) => {
    if (checkOnlineStatus()) {
      try {
        const newTransaction = await api.addTransaction(username, transaction);
        const transactions = await offlineApi.getTransactions(username);
        offlineStorage.store(`transactions_${username}`, [newTransaction, ...transactions]);
        return newTransaction;
      } catch (error) {
        const newTransaction = {
          id: offlineStorage.generateId(),
          ...transaction,
          created_at: Date.now()
        };
        const transactions = await offlineApi.getTransactions(username);
        offlineStorage.store(`transactions_${username}`, [newTransaction, ...transactions]);
        offlineStorage.storePendingOperation(username, {
          type: 'add_transaction',
          data: { transaction }
        });
        return newTransaction;
      }
    } else {
      const newTransaction = {
        id: offlineStorage.generateId(),
        ...transaction,
        created_at: Date.now()
      };
      const transactions = await offlineApi.getTransactions(username);
      offlineStorage.store(`transactions_${username}`, [newTransaction, ...transactions]);
      offlineStorage.storePendingOperation(username, {
        type: 'add_transaction',
        data: { transaction }
      });
      return newTransaction;
    }
  },

  deleteTransaction: async (username: string, id: string) => {
    if (checkOnlineStatus()) {
      try {
        await api.deleteTransaction(id);
        const transactions = await offlineApi.getTransactions(username);
        const updatedTransactions = transactions.filter((transaction: any) => transaction.id !== id);
        offlineStorage.store(`transactions_${username}`, updatedTransactions);
        return { message: 'Transaction deleted successfully' };
      } catch (error) {
        const transactions = await offlineApi.getTransactions(username);
        const updatedTransactions = transactions.filter((transaction: any) => transaction.id !== id);
        offlineStorage.store(`transactions_${username}`, updatedTransactions);
        offlineStorage.storePendingOperation(username, {
          type: 'delete_transaction',
          data: { id }
        });
        return { message: 'Transaction deleted locally, will sync when online' };
      }
    } else {
      const transactions = await offlineApi.getTransactions(username);
      const updatedTransactions = transactions.filter((transaction: any) => transaction.id !== id);
      offlineStorage.store(`transactions_${username}`, updatedTransactions);
      offlineStorage.storePendingOperation(username, {
        type: 'delete_transaction',
        data: { id }
      });
      return { message: 'Transaction deleted locally, will sync when online' };
    }
  },

  updateTransaction: async (username: string, id: string, updates: any) => {
    if (checkOnlineStatus()) {
      try {
        await api.updateTransaction(id, updates);
        const transactions = await offlineApi.getTransactions(username);
        const updatedTransactions = transactions.map((transaction: any) => 
          transaction.id === id ? { ...transaction, ...updates } : transaction
        );
        offlineStorage.store(`transactions_${username}`, updatedTransactions);
        return { message: 'Transaction updated successfully' };
      } catch (error) {
        const transactions = await offlineApi.getTransactions(username);
        const updatedTransactions = transactions.map((transaction: any) => 
          transaction.id === id ? { ...transaction, ...updates } : transaction
        );
        offlineStorage.store(`transactions_${username}`, updatedTransactions);
        offlineStorage.storePendingOperation(username, {
          type: 'update_transaction',
          data: { id, updates }
        });
        return { message: 'Transaction updated locally, will sync when online' };
      }
    } else {
      const transactions = await offlineApi.getTransactions(username);
      const updatedTransactions = transactions.map((transaction: any) => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      );
      offlineStorage.store(`transactions_${username}`, updatedTransactions);
      offlineStorage.storePendingOperation(username, {
        type: 'update_transaction',
        data: { id, updates }
      });
      return { message: 'Transaction updated locally, will sync when online' };
    }
  }
};
