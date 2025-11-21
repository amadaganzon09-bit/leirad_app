
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json() as any);

// Supabase Client
// Using provided credentials as defaults
const supabaseUrl = process.env.SUPABASE_URL || 'https://defhdpdtclecmlsnqcvz.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmhkcGR0Y2xlY21sc25xY3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MDI1NTYsImV4cCI6MjA3OTE3ODU1Nn0.NRwgxf45CwKBT6yj2gSR72-GG7s1aBTDq8M-iho1xqk';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { username, passcode } = req.body;

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  // Insert User
  const { error } = await supabase
    .from('users')
    .insert([{ username, passcode }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, passcode } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.passcode !== passcode) {
    return res.status(401).json({ error: 'Incorrect passcode' });
  }

  res.status(200).json({ message: 'Login successful', user: { username: user.username } });
});

// Update Passcode
app.put('/api/auth/passcode', async (req, res) => {
  const { username, currentPasscode, newPasscode } = req.body;

  // Verify old passcode
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!user || user.passcode !== currentPasscode) {
    return res.status(401).json({ error: 'Incorrect current passcode' });
  }

  // Update
  const { error } = await supabase
    .from('users')
    .update({ passcode: newPasscode })
    .eq('username', username);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Passcode updated' });
});

// --- TODO ROUTES ---

// Get Todos
app.get('/api/todos', async (req, res) => {
  const { username } = req.query;

  if (!username) return res.status(400).json({ error: 'Username required' });

  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .eq('username', username)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Convert DB snake_case to camelCase for frontend consistency if needed, 
  // or handle mapping on frontend. Let's map here for ease.
  const mappedTodos = todos.map(t => ({
    id: t.id,
    text: t.text,
    completed: t.completed,
    createdAt: parseInt(t.created_at),
    completedAt: t.completed_at ? parseInt(t.completed_at) : undefined,
    dueDate: t.due_date ? parseInt(t.due_date) : undefined,
    priority: t.priority,
    category: t.category
  }));

  res.status(200).json(mappedTodos);
});

// Create Todo
app.post('/api/todos', async (req, res) => {
  const { username, text, createdAt, dueDate, priority, category } = req.body;

  const { data, error } = await supabase
    .from('todos')
    .insert([{
      username,
      text,
      completed: false,
      created_at: createdAt,
      due_date: dueDate,
      priority,
      category
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Map back to frontend format
  const newTodo = {
    id: data.id,
    text: data.text,
    completed: data.completed,
    createdAt: parseInt(data.created_at),
    dueDate: data.due_date ? parseInt(data.due_date) : undefined,
    priority: data.priority,
    category: data.category
  };

  res.status(201).json(newTodo);
});

// Toggle Todo (or Edit)
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Expects { completed, completedAt, text, etc }

  // Map frontend camelCase to DB snake_case
  const dbUpdates: any = {};
  if (updates.text !== undefined) dbUpdates.text = updates.text;
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  
  // Handle setting fields to null (e.g. uncompleting)
  if (updates.completed === false) dbUpdates.completed_at = null;

  const { error } = await supabase
    .from('todos')
    .update(dbUpdates)
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Updated successfully' });
});

// Delete Todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Deleted successfully' });
});

// Bulk Delete
app.post('/api/todos/bulk-delete', async (req, res) => {
  const { ids } = req.body;

  const { error } = await supabase
    .from('todos')
    .delete()
    .in('id', ids);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Bulk delete successful' });
});

// Bulk Update (Complete or Date)
app.post('/api/todos/bulk-update', async (req, res) => {
  const { ids, updates } = req.body;

  const dbUpdates: any = {};
  if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
  if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

  const { error } = await supabase
    .from('todos')
    .update(dbUpdates)
    .in('id', ids);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Bulk update successful' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
