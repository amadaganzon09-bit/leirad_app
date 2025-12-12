
import { createClient } from '@supabase/supabase-js';
import { Priority, Category, Todo } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://defhdpdtclecmlsnqcvz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmhkcGR0Y2xlY21sc25xY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDI1NTYsImV4cCI6MjA3OTE3ODU1Nn0.NRwgxf45CwKBT6yj2gSR72-GG7s1aBTDq8M-iho1xqk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const api = {
  // --- AUTH ---
  register: async (username: string, passcode: string) => {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Insert new user
    const { error } = await supabase
      .from('users')
      .insert([{ username, passcode }]);

    if (error) throw new Error(error.message);
    return { message: 'User registered successfully' };
  },

  login: async (username: string, passcode: string) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    if (user.passcode !== passcode) {
      throw new Error('Incorrect passcode');
    }

    return { message: 'Login successful', user: { username: user.username } };
  },

  updatePasscode: async (username: string, currentPasscode: string, newPasscode: string) => {
    // Verify old passcode
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (!user || user.passcode !== currentPasscode) {
      throw new Error('Incorrect current passcode');
    }

    const { error } = await supabase
      .from('users')
      .update({ passcode: newPasscode })
      .eq('username', username);

    if (error) throw new Error(error.message);
    return { message: 'Passcode updated' };
  },

  // --- TODOS ---
  getTodos: async (username: string): Promise<Todo[]> => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Map DB snake_case to frontend camelCase
    return (data || []).map((t: any) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      createdAt: parseInt(t.created_at),
      completedAt: t.completed_at ? parseInt(t.completed_at) : undefined,
      dueDate: t.due_date ? parseInt(t.due_date) : undefined,
      priority: t.priority as Priority,
      category: t.category as Category
    }));
  },

  addTodo: async (username: string, text: string, dueDate: number | undefined, priority: Priority, category: Category): Promise<Todo> => {
    const createdAt = Date.now();

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        username,
        text,
        completed: false,
        created_at: createdAt,
        due_date: dueDate || null,
        priority,
        category
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: data.id,
      text: data.text,
      completed: data.completed,
      createdAt: parseInt(data.created_at),
      dueDate: data.due_date ? parseInt(data.due_date) : undefined,
      priority: data.priority as Priority,
      category: data.category as Category
    };
  },

  updateTodo: async (id: string, updates: Partial<Todo>) => {
    // Map updates to snake_case
    const dbUpdates: any = {};
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

    // If uncompleting, ensure completed_at is cleared
    if (updates.completed === false) {
      dbUpdates.completed_at = null;
    }

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Updated successfully' };
  },

  deleteTodo: async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Deleted successfully' };
  },

  bulkDelete: async (ids: string[]) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', ids);

    if (error) throw new Error(error.message);
    return { message: 'Bulk delete successful' };
  },

  bulkUpdate: async (ids: string[], updates: Partial<Todo>) => {
    const dbUpdates: any = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .in('id', ids);

    if (error) throw new Error(error.message);
    return { message: 'Bulk update successful' };
  },

  // --- BUDGETS ---
  getBudgets: async (username: string) => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  addBudget: async (username: string, category: string, limit: number, period: string = 'monthly') => {
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        username,
        category,
        limit_amount: limit,
        period,
        spent: 0,
        created_at: Date.now()
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateBudget: async (id: string, updates: { limit_amount?: number; spent?: number }) => {
    const { error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Budget updated successfully' };
  },

  deleteBudget: async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Budget deleted successfully' };
  },

  // --- TRANSACTIONS ---
  getTransactions: async (username: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('username', username)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  addTransaction: async (username: string, transaction: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, username }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Transaction deleted successfully' };
  },

  updateTransaction: async (id: string, updates: any) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Transaction updated successfully' };
  },

  // --- WALLETS ---
  getWallets: async (username: string) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  addWallet: async (username: string, wallet: any) => {
    const { data, error } = await supabase
      .from('wallets')
      .insert([{ ...wallet, username, created_at: Date.now() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateWallet: async (id: string, updates: { balance?: number; name?: string }) => {
    const { error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Wallet updated successfully' };
  },

  deleteWallet: async (id: string) => {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Wallet deleted successfully' };
  },

  // --- GOALS ---
  getGoals: async (username: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  addGoal: async (username: string, goal: any) => {
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goal, username, created_at: Date.now() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  updateGoal: async (id: string, updates: { saved_amount?: number; target_amount?: number }) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Goal updated successfully' };
  },

  deleteGoal: async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Goal deleted successfully' };
  },

  loginWithFacebook: async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: window.location.origin } });
  },

  getOAuthUsername: async (): Promise<string | null> => {
    const { data } = await supabase.auth.getUser();
    const u = data.user;
    if (!u) return null;
    const email = u.email || (u.user_metadata && (u.user_metadata.email as string));
    const name = u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name);
    return (email as string) || (name as string) || null;
  },
  
  ensureUser: async (username: string, provider: string = 'supabase') => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) return { message: 'User exists' };

    const { error } = await supabase
      .from('users')
      .insert([{ username, passcode: `oauth:${provider}` }]);

    if (error) throw new Error(error.message);
    return { message: 'User created' };
  }
};
