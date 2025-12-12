
import React, { useState, useEffect, useCallback } from 'react';
import { ListTodo, Calendar, CheckCircle2, Layout, LogOut, User as UserIcon, AlertCircle, Clock, Layers, ChevronDown, CheckSquare, Trash2, Check, X, Loader2, Sparkles, ClipboardList, Archive, Settings, CircleHelp, Eye, EyeOff, Zap, Target, ArrowLeft, Timer, Play, Pause, RotateCcw, Wallet, Plus } from 'lucide-react';
import TodoForm from './components/TodoForm';
import TodoItem from './components/TodoItem';
import ToastContainer from './components/ToastContainer';
import Login from './components/Login';
import Footer from './components/Footer';
import Modal from './components/Modal';
import ChangePasscodeModal from './components/ChangePasscodeModal';
import HelpModal from './components/HelpModal';
import ReminderModal from './components/ReminderModal';
import Dashboard from './components/Dashboard';
import FocusSelectModal from './components/FocusSelectModal';
import BudgetTracker from './components/BudgetTracker';
import { Todo, ToastData, ToastType, Priority, Category } from './types';
import { api } from './utils/api';
import { offlineApi } from './utils/offlineApi';

const USER_STORAGE_KEY = 'leiradmaster-current-user';

// Helper component for list sections with cleaner UI
const TodoSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  colorClass: string;
  defaultExpanded?: boolean;
}> = ({ title, icon, count, children, colorClass, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (count === 0) return null;

  return (
    <div className="mb-8 last:mb-0 animate-slide-in group/section">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center w-full gap-3 mb-4 pl-1 hover:opacity-80 transition-opacity"
      >
        <span className={`p-2 rounded-xl bg-white shadow-sm border border-gray-100 ${colorClass}`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" }) : icon}
        </span>
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="ml-auto flex items-center gap-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-100 shadow-sm ${colorClass}`}>
            {count}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div className={`space-y-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isExpanded ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'}`}>
        {children}
      </div>
    </div>
  );
};

import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  // State
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // View State
  const [activeView, setActiveView] = useState<'tasks' | 'budget'>('tasks');

  // Loading State
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCompletingFocusTask, setIsCompletingFocusTask] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const [isFocusSelectOpen, setIsFocusSelectOpen] = useState(false);

  // Mobile Add Form State
  const [isMobileAddOpen, setIsMobileAddOpen] = useState(false);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(25 * 60); // Default 25 mins
  const [timerLeft, setTimerLeft] = useState(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk' | null;
    itemId?: string;
  }>({ isOpen: false, type: null });

  const [completeModal, setCompleteModal] = useState<{
    isOpen: boolean;
    itemId: string | null;
  }>({ isOpen: false, itemId: null });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Reminder State
  const [reminderTasks, setReminderTasks] = useState<Todo[]>([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  // Check for logged in user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      const oauthUsername = await api.getOAuthUsername();
      if (!oauthUsername) return;
      await api.ensureUser(oauthUsername, 'facebook');
      if (!localStorage.getItem(USER_STORAGE_KEY)) {
        handleLogin(oauthUsername);
      }
    };
    hydrate();
  }, []);



  // Load todos when user changes via API
  useEffect(() => {
    if (!user) return;

    const fetchTodos = async () => {
      try {
        const data = await offlineApi.getTodos(user);
        setTodos(data);
        checkReminders(data);
      } catch (error) {
        console.error("Failed to load todos from API", error);
        addToast("Failed to load your tasks.", ToastType.ERROR);
        setTodos([]);
      }
    };

    fetchTodos();
  }, [user]);

  // Focus Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerActive && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      addToast("Focus session completed! Take a break.", ToastType.SUCCESS, 5000);
      // Optional: Play sound here
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timerLeft]);

  const checkReminders = (currentTodos: Todo[]) => {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const startTs = tomorrowStart.getTime();
    const endTs = tomorrowEnd.getTime();

    const upcoming = currentTodos.filter((t) =>
      !t.completed &&
      t.dueDate &&
      t.dueDate >= startTs &&
      t.dueDate <= endTs
    );

    if (upcoming.length > 0) {
      setReminderTasks(upcoming);
      setIsReminderOpen(true);
    }
  };

  // Reset selection when mode changes
  useEffect(() => {
    if (!isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode]);

  // Toast Management
  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const newToast: ToastData = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      message,
      type,
      duration,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth Handlers
  const handleLogin = (username: string) => {
    localStorage.setItem(USER_STORAGE_KEY, username);
    setUser(username);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setTodos([]);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      setIsFocusMode(false);
      setFocusedTaskId(null);
      setIsLoggingOut(false);
      setIsReminderOpen(false);
      setIsTimerActive(false);
      setActiveView('tasks');
      addToast("You have been logged out.", ToastType.INFO);
    }, 800);
  };

  // CRUD Operations
  const addTodo = async (text: string, dueDate?: number, priority: Priority = 'medium', category: Category = 'general') => {
    if (!user) return;
    try {
      const newTodo = await offlineApi.addTodo(user, text, dueDate, priority, category);
      setTodos((prev) => [newTodo, ...prev]);
      addToast("Task added successfully!", ToastType.SUCCESS);
      setIsMobileAddOpen(false); // Close mobile modal on success
    } catch (e) {
      addToast("Failed to save task.", ToastType.ERROR);
    }
  };

  const performToggle = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newState = !todo.completed;
    const completedAt = newState ? Date.now() : undefined;

    // Optimistic Update
    setTodos((prev) => prev.map(t => {
      if (t.id === id) {
        return { ...t, completed: newState, completedAt };
      }
      return t;
    }));

    try {
      await offlineApi.updateTodo(user!, id, { completed: newState, completedAt });
      if (newState) {
        addToast("Task completed! Great job!", ToastType.SUCCESS, 2000);
      }
    } catch (e) {
      // Revert if fail
      setTodos((prev) => prev.map(t => {
        if (t.id === id) {
          return { ...t, completed: !newState, completedAt: todo.completedAt };
        }
        return t;
      }));
      addToast("Failed to update task status.", ToastType.ERROR);
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    if (!todo.completed) {
      setCompleteModal({ isOpen: true, itemId: id });
    } else {
      performToggle(id);
    }
  };

  const confirmComplete = async () => {
    setIsCompleting(true);
    if (completeModal.itemId) {
      // Set loading state for focus mode completion
      if (focusedTaskId === completeModal.itemId) {
        setIsCompletingFocusTask(true);
      }
      await performToggle(completeModal.itemId);
      // Reset loading state
      if (focusedTaskId === completeModal.itemId) {
        setIsCompletingFocusTask(false);
      }
    }
    setIsCompleting(false);
    setCompleteModal({ isOpen: false, itemId: null });
  };

  const initiateDelete = (id: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      itemId: id
    });
  };

  const initiateBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteModal({
      isOpen: true,
      type: 'bulk',
    });
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    if (deleteModal.type === 'single' && deleteModal.itemId) {
      if (deleteModal.itemId === focusedTaskId) {
        setIsFocusMode(false);
        setFocusedTaskId(null);
        setIsTimerActive(false);
      }

      try {
        await offlineApi.deleteTodo(user!, deleteModal.itemId);
        setTodos((prev) => prev.filter(todo => todo.id !== deleteModal.itemId));
        addToast("Task deleted.", ToastType.INFO);
      } catch (e) {
        addToast("Failed to delete task.", ToastType.ERROR);
      }

    } else if (deleteModal.type === 'bulk') {
      const idsToDelete = Array.from(selectedIds) as string[];
      try {
        await offlineApi.bulkDelete(user!, idsToDelete);
        setTodos(prev => prev.filter(t => !selectedIds.has(t.id)));
        addToast(`Deleted ${selectedIds.size} tasks.`, ToastType.INFO);
        setIsSelectionMode(false);
      } catch (e) {
        addToast("Failed to bulk delete.", ToastType.ERROR);
      }
    }
    setIsDeleting(false);
    setDeleteModal({ isOpen: false, type: null });
  };

  const editTodo = async (id: string, newText: string) => {
    try {
      await offlineApi.updateTodo(user!, id, { text: newText });
      setTodos((prev) => prev.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      ));
      addToast("Task updated.", ToastType.SUCCESS);
    } catch (e) {
      addToast("Failed to save changes.", ToastType.ERROR);
    }
  };

  // Bulk Actions
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = todos.map(t => t.id);
    if (selectedIds.size === allIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const handleBulkComplete = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds) as string[];
    const completedAt = Date.now();

    try {
      await offlineApi.bulkUpdate(user!, ids, { completed: true, completedAt });
      setTodos(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, completed: true, completedAt } : t));
      addToast(`Marked ${selectedIds.size} tasks as complete.`, ToastType.SUCCESS);
      setIsSelectionMode(false);
    } catch (e) {
      addToast("Failed to update tasks.", ToastType.ERROR);
    }
  };

  const handleBulkDateChange = async (dateString: string) => {
    if (!dateString || selectedIds.size === 0) return;
    const [y, m, d] = dateString.split('-').map(Number);
    const timestamp = new Date(y, m - 1, d).getTime();
    const ids = Array.from(selectedIds) as string[];

    try {
      await offlineApi.bulkUpdate(user!, ids, { dueDate: timestamp });
      setTodos(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, dueDate: timestamp } : t));
      addToast(`Updated due date for ${selectedIds.size} tasks.`, ToastType.SUCCESS);
      setIsSelectionMode(false);
    } catch (e) {
      addToast("Failed to update date.", ToastType.ERROR);
    }
  };

  // Focus Mode Handlers
  const handleFocusClick = () => {
    if (isFocusMode) {
      setIsFocusMode(false);
      setFocusedTaskId(null);
      setIsTimerActive(false);
    } else {
      const hasActiveTasks = todos.some(t => !t.completed);
      if (!hasActiveTasks) {
        addToast("No active tasks to focus on! Add one first.", ToastType.INFO);
        return;
      }
      setIsFocusSelectOpen(true);
    }
  };

  const handleSelectFocusTask = (id: string) => {
    setFocusedTaskId(id);
    setIsFocusMode(true);
    setIsFocusSelectOpen(false);
    setTimerDuration(25 * 60);
    setTimerLeft(25 * 60);
    setIsTimerActive(false);
    addToast("Focus Mode enabled. Distractions hidden.", ToastType.SUCCESS);
  };

  // Timer Helpers
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const setTimerPreset = (minutes: number) => {
    const secs = minutes * 60;
    setTimerDuration(secs);
    setTimerLeft(secs);
    setIsTimerActive(false);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimerLeft(timerDuration);
  };

  // Sorting helper
  const sortTasks = (a: Todo, b: Todo) => {
    const priorityVal = (p?: Priority) => {
      switch (p) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 2;
      }
    };
    const pA = priorityVal(a.priority);
    const pB = priorityVal(b.priority);
    if (pA !== pB) return pB - pA;
    return (a.dueDate || 0) - (b.dueDate || 0);
  };

  // Data Grouping
  const getCategorizedTodos = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 86400000;

    const activeTodos = todos.filter(t => !t.completed);
    const completedTodos = todos.filter(t => t.completed);

    const overdue = activeTodos
      .filter(t => t.dueDate && t.dueDate < Date.now())
      .sort(sortTasks);

    const today = activeTodos
      .filter(t => t.dueDate && t.dueDate >= Date.now() && t.dueDate < endOfToday)
      .sort(sortTasks);

    const upcoming = activeTodos
      .filter(t => t.dueDate && t.dueDate >= endOfToday)
      .sort(sortTasks);

    const noDate = activeTodos
      .filter(t => !t.dueDate)
      .sort(sortTasks);

    return { overdue, today, upcoming, noDate, completed: completedTodos };
  };

  const categories = getCategorizedTodos();
  const hasOverdue = categories.overdue.length > 0;

  const isListEmpty = () => {
    if (filter === 'completed') return categories.completed.length === 0;
    if (filter === 'active') return todos.filter(t => !t.completed).length === 0;
    return todos.length === 0;
  };

  const focusedTask = todos.find(t => t.id === focusedTaskId);
  const showFab = !isFocusMode && !isSelectionMode && activeView === 'tasks';

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} addToast={addToast} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-32 transition-all duration-500 ${isFocusMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Atmosphere */}
      {!isFocusMode && (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
          <div className="absolute top-[10%] -right-[20%] w-[60%] h-[60%] bg-purple-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-pink-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* Header */}
        <header className={`flex items-center justify-between mb-2 py-3 px-4 rounded-2xl backdrop-blur-md border shadow-sm sticky top-4 z-30 transition-all duration-500 ${isFocusMode ? 'bg-slate-800/80 border-slate-700 shadow-xl' : 'bg-white/60 border-white/40'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md transition-colors ${isFocusMode ? 'bg-indigo-500 text-white shadow-indigo-900/50' : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-200'}`}>
              <ListTodo className="w-5 h-5" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors hidden sm:inline ${isFocusMode ? 'text-white' : 'text-slate-800'}`}>Task<span className="text-indigo-600">Master</span></span>
          </div>

          <div className="flex items-center gap-3">
            {activeView === 'tasks' && (
              <button
                onClick={handleFocusClick}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isFocusMode ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/50 scale-110' : 'text-slate-500 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isFocusMode ? <Eye className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
              </button>
            )}

            <div className={`w-px h-6 mx-1 hidden sm:block transition-colors ${isFocusMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

            <button
              onClick={() => setIsHelpOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${isFocusMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'}`}
              title="Help Guide"
            >
              <CircleHelp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-medium text-sm">Help</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ${isFocusMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="hidden md:inline font-medium text-sm">Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group ml-1 ${isFocusMode ? 'bg-slate-800 text-rose-400 border-slate-700 hover:bg-rose-900/20' : 'bg-white text-rose-500 border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:shadow-md'}`}
              title="Log Out"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden md:inline font-medium text-sm">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span className="hidden md:inline font-medium text-sm">Logout</span>
                </>
              )}
            </button>

          </div>
        </header>

        {/* Navigation Tabs (Sticky Below Header) */}
        {!isFocusMode && (
          <div className="sticky top-[88px] z-20 mb-8 flex justify-center px-4 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 ring-1 ring-slate-900/5 flex items-center gap-1 pointer-events-auto transform transition-all hover:shadow-md hover:scale-105">
              <button
                onClick={() => setActiveView('tasks')}
                className={`
                            relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                            ${activeView === 'tasks'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }
                        `}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
                {hasOverdue && activeView !== 'tasks' && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => setActiveView('budget')}
                className={`
                            relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                            ${activeView === 'budget'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                  }
                        `}
              >
                <Wallet className="w-4 h-4" />
                Budget
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        {isFocusMode && focusedTask ? (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Focus Timer Component */}
            <div className="mb-8 w-full max-w-2xl">
              <div className="bg-slate-800/50 backdrop-blur rounded-3xl border border-slate-700 p-6 flex flex-col items-center shadow-xl">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">
                  <Timer className="w-4 h-4" />
                  <span>Focus Timer</span>
                </div>

                <div className={`text-7xl sm:text-8xl font-mono font-bold mb-8 tabular-nums tracking-tight transition-colors duration-300 ${isTimerActive ? 'text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'text-slate-400'}`}>
                  {formatTimer(timerLeft)}
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <button
                    onClick={resetTimer}
                    className="p-4 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => setIsTimerActive(!isTimerActive)}
                    className={`p-6 rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isTimerActive ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'}`}
                    title={isTimerActive ? "Pause" : "Start"}
                  >
                    {isTimerActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current pl-1" />}
                  </button>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {[15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setTimerPreset(mins)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${timerDuration === mins * 60 ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full max-w-2xl transform transition-all hover:scale-[1.01] duration-500">
              <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${focusedTask.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                      focusedTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                      {focusedTask.priority} Priority
                    </span>
                    {focusedTask.dueDate && (
                      <span className="text-slate-400 flex items-center gap-2 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        {new Date(focusedTask.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">{focusedTask.text}</h1>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700/50">
                    <button
                      onClick={() => toggleTodo(focusedTask.id)}
                      disabled={isCompletingFocusTask}
                      className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCompletingFocusTask ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          <span>Complete Task</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsFocusMode(false);
                        setIsTimerActive(false);
                      }}
                      className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5 rotate-180" />
                      Exit Focus
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-12 text-slate-500 text-sm max-w-md text-center italic">
              "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus."
            </p>

          </div>
        ) : (
          <div className="transition-all duration-500">

            {activeView === 'budget' ? (
              <BudgetTracker addToast={addToast} username={user || ''} />
            ) : (
              <>
                <Dashboard user={user} todos={todos} />

                {/* Desktop Inline Form */}
                <div className={`hidden sm:block mb-12 transition-all duration-300 ${isSelectionMode ? 'opacity-50 pointer-events-none blur-sm scale-95' : 'opacity-100 scale-100'}`}>
                  <TodoForm onAdd={addTodo} addToast={addToast} />
                </div>

                {/* Mobile FAB */}
                {showFab && (
                  <button
                    onClick={() => setIsMobileAddOpen(true)}
                    className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                    aria-label="Add Task"
                  >
                    <Plus className="w-7 h-7" />
                  </button>
                )}

                {/* Mobile Add Modal (Centered Popup) */}
                {isMobileAddOpen && (
                  <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center sm:hidden px-4 animate-in fade-in duration-200">
                    {/* Backdrop click handler */}
                    <div className="absolute inset-0" onClick={() => setIsMobileAddOpen(false)}></div>

                    <div
                      className="bg-slate-50 w-full max-w-sm rounded-3xl p-5 shadow-2xl shadow-slate-900/50 animate-in zoom-in-95 duration-300 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-5 pl-2 pr-1">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                            <Plus className="w-5 h-5" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">New Task</h3>
                        </div>
                        <button
                          onClick={() => setIsMobileAddOpen(false)}
                          className="p-2 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-slate-600 shadow-sm transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <TodoForm onAdd={addTodo} addToast={addToast} autoFocus={true} />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
                  <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                    {(['all', 'active', 'completed'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        disabled={isSelectionMode}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase ${filter === f ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {todos.length > 0 && (
                    <button
                      onClick={() => setIsSelectionMode(!isSelectionMode)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isSelectionMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-100 ring-offset-2' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
                    >
                      {isSelectionMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                      {isSelectionMode ? 'Done' : 'Select'}
                    </button>
                  )}
                </div>

                <div className="min-h-[200px] space-y-2">
                  {isListEmpty() ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200/60 backdrop-blur-sm">
                      <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                        <ClipboardList className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        No tasks found
                      </h3>
                      <p className="text-slate-500 text-center max-w-xs leading-relaxed">
                        Add a task above to get started on your journey.
                      </p>
                    </div>
                  ) : (
                    <>
                      {(filter !== 'completed') && (
                        <TodoSection
                          title="Overdue"
                          icon={<AlertCircle />}
                          count={categories.overdue.length}
                          colorClass="text-rose-600"
                        >
                          {categories.overdue.map(todo => (
                            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={initiateDelete} onEdit={editTodo} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(todo.id)} onSelect={toggleSelection} />
                          ))}
                        </TodoSection>
                      )}

                      {(filter !== 'completed') && (
                        <TodoSection
                          title="Today"
                          icon={<Calendar />}
                          count={categories.today.length}
                          colorClass="text-indigo-600"
                        >
                          {categories.today.map(todo => (
                            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={initiateDelete} onEdit={editTodo} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(todo.id)} onSelect={toggleSelection} />
                          ))}
                        </TodoSection>
                      )}

                      {(filter !== 'completed') && (
                        <TodoSection
                          title="Upcoming"
                          icon={<Clock />}
                          count={categories.upcoming.length}
                          colorClass="text-blue-600"
                          defaultExpanded={categories.overdue.length === 0 && categories.today.length === 0}
                        >
                          {categories.upcoming.map(todo => (
                            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={initiateDelete} onEdit={editTodo} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(todo.id)} onSelect={toggleSelection} />
                          ))}
                        </TodoSection>
                      )}

                      {(filter !== 'completed') && (
                        <TodoSection
                          title="Inbox"
                          icon={<Layers />}
                          count={categories.noDate.length}
                          colorClass="text-slate-500"
                        >
                          {categories.noDate.map(todo => (
                            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={initiateDelete} onEdit={editTodo} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(todo.id)} onSelect={toggleSelection} />
                          ))}
                        </TodoSection>
                      )}

                      {(filter !== 'active') && (
                        <TodoSection
                          title="Completed"
                          icon={<CheckCircle2 />}
                          count={categories.completed.length}
                          colorClass="text-emerald-600"
                          defaultExpanded={filter === 'completed'}
                        >
                          {categories.completed.map(todo => (
                            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={initiateDelete} onEdit={editTodo} isSelectionMode={isSelectionMode} isSelected={selectedIds.has(todo.id)} onSelect={toggleSelection} />
                          ))}
                        </TodoSection>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            <Footer />
          </div>
        )}
      </div>

      {!isFocusMode && activeView === 'tasks' && (
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-md transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isSelectionMode && selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/50 p-4 flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3 pl-2">
              <span className="bg-white/20 text-white font-bold text-sm w-8 h-8 flex items-center justify-center rounded-full">
                {selectedIds.size}
              </span>
              <span className="text-sm font-medium text-slate-300">Selected</span>
            </div>

            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
              <button
                onClick={handleBulkComplete}
                className="p-2 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-lg transition-colors"
                title="Complete"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>

              <div className="relative">
                <input
                  type="date"
                  onChange={(e) => handleBulkDateChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <button
                  className="p-2 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 rounded-lg transition-colors"
                  title="Reschedule"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>

              <div className="w-px h-5 bg-white/20 mx-1"></div>

              <button
                onClick={initiateBulkDelete}
                className="p-2 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isSelectionMode && selectedIds.size === 0 && todos.length > 0 && !isFocusMode && activeView === 'tasks' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-slide-in">
          <button
            onClick={selectAll}
            className="bg-white px-6 py-3 rounded-full shadow-xl border border-slate-100 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Select All Tasks
          </button>
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        title="Delete Task?"
        message={deleteModal.type === 'single' ? "Are you sure you want to delete this task? This cannot be undone." : `Delete ${selectedIds.size} tasks permanently?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, type: null })}
        isDestructive={true}
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      <Modal
        isOpen={completeModal.isOpen}
        title="Complete Task?"
        message="Great job! Mark this task as done?"
        onConfirm={confirmComplete}
        onCancel={() => setCompleteModal({ isOpen: false, itemId: null })}
        isDestructive={false}
        confirmLabel="Complete"
        isLoading={isCompleting}
      />

      <ChangePasscodeModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        username={user}
        addToast={addToast}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        tasks={reminderTasks}
      />

      <FocusSelectModal
        isOpen={isFocusSelectOpen}
        onClose={() => setIsFocusSelectOpen(false)}
        tasks={todos.filter(t => !t.completed)}
        onSelect={handleSelectFocusTask}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
