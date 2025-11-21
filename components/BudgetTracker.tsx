import React, { useState, useEffect } from 'react';
import {
    BarChart3, Receipt, Target, Award, Wallet
} from 'lucide-react';
import { AddToastFunction, ToastType } from '../types';
import { api } from '../utils/api';
import { offlineApi } from '../utils/offlineApi';
import { Transaction, Budget, Goal, WalletType } from '../types/budget';
import { CATEGORIES } from '../constants/budget';

// Components
import ConfirmModal from './ConfirmModal';
import BudgetOverview from './budget/BudgetOverview';
import PaginatedTransactionList from './budget/PaginatedTransactionList';
import PaginatedBudgetList from './budget/PaginatedBudgetList';
import PaginatedGoalList from './budget/PaginatedGoalList';
import PaginatedWalletList from './budget/PaginatedWalletList';

// Modals
import AddTransactionModal from './budget/Modals/AddTransactionModal';
import AddBudgetModal from './budget/Modals/AddBudgetModal';
import AddGoalModal from './budget/Modals/AddGoalModal';
import AddWalletModal from './budget/Modals/AddWalletModal';

interface BudgetTrackerProps {
    addToast: AddToastFunction;
    username: string;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ addToast, username }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals' | 'wallets'>('overview');

    // Data States
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [wallets, setWallets] = useState<WalletType[]>([]);

    // Loading States
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Loading states for individual items
    const [loadingTransactionId, setLoadingTransactionId] = useState<string | null>(null);
    const [loadingBudgetId, setLoadingBudgetId] = useState<string | null>(null);
    const [loadingGoalId, setLoadingGoalId] = useState<string | null>(null);
    const [loadingWalletId, setLoadingWalletId] = useState<string | null>(null);

    // Modal States
    const [isAddingTransaction, setIsAddingTransaction] = useState(false);
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [isAddingWallet, setIsAddingWallet] = useState(false);

    // Edit States
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [editingWallet, setEditingWallet] = useState<WalletType | null>(null);

    // Confirmation Modal States
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        budgetId: string | null;
        budgetName: string;
    }>({ isOpen: false, budgetId: null, budgetName: '' });

    const [deleteTransactionConfirm, setDeleteTransactionConfirm] = useState<{
        isOpen: boolean;
        transactionId: string | null;
        transactionDesc: string;
    }>({ isOpen: false, transactionId: null, transactionDesc: '' });

    const [deleteGoalConfirm, setDeleteGoalConfirm] = useState<{
        isOpen: boolean;
        goalId: string | null;
        goalName: string;
    }>({ isOpen: false, goalId: null, goalName: '' });

    const [deleteWalletConfirm, setDeleteWalletConfirm] = useState<{
        isOpen: boolean;
        walletId: string | null;
        walletName: string;
    }>({ isOpen: false, walletId: null, walletName: '' });

    // Load Data
    const loadData = async () => {
        if (!username) return;
        setIsLoading(true);
        try {
            const [budgetsData, transactionsData, walletsData, goalsData] = await Promise.all([
                offlineApi.getBudgets(username),
                offlineApi.getTransactions(username),
                offlineApi.getWallets(username),
                offlineApi.getGoals(username)
            ]);

            setBudgets(budgetsData.map((b: any) => ({
                id: b.id,
                category: b.category,
                limit: b.limit_amount,
                spent: b.spent || 0,
                period: b.period,
                icon: CATEGORIES.find(c => c.name === b.category)?.icon || <Target className="w-4 h-4" />,
                color: CATEGORIES.find(c => c.name === b.category)?.color || 'bg-slate-500'
            })));

            setTransactions(transactionsData.map((t: any) => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: t.date,
                walletId: t.wallet_id,
                tags: t.tags || []
            })));

            setGoals(goalsData.map((g: any) => ({
                id: g.id,
                name: g.name,
                targetAmount: g.target_amount,
                savedAmount: g.saved_amount,
                deadline: g.deadline,
                color: g.color || 'bg-indigo-500'
            })));

            setWallets(walletsData.map((w: any) => ({
                id: w.id,
                name: w.name,
                type: w.type,
                balance: w.balance,
                color: w.color,
                icon: null // Icon handled in component based on type
            })));

        } catch (error) {
            console.error(error);
            addToast('Failed to load data', ToastType.ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [username]);


    // Handlers
    const handleAddTransaction = async (data: any) => {
        setIsSaving(true);
        try {
            // Convert camelCase to snake_case for database
            await offlineApi.addTransaction(username, {
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: data.date,
                wallet_id: data.walletId, // Convert to snake_case
                tags: []
            });

            // Update wallet balance
            const wallet = wallets.find(w => w.id === data.walletId);
            if (wallet) {
                const newBalance = data.type === 'income'
                    ? wallet.balance + data.amount
                    : wallet.balance - data.amount;
                await offlineApi.updateWallet(username, wallet.id, { balance: newBalance });
            }

            // Update budget spent if expense
            if (data.type === 'expense') {
                const budget = budgets.find(b => b.category === data.category);
                if (budget) {
                    await offlineApi.updateBudget(username, budget.id, { spent: budget.spent + data.amount });
                }
            }

            await loadData();
            addToast('Transaction added successfully', ToastType.SUCCESS);
        } catch (error: any) {
            addToast(error.message || 'Failed to add transaction', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditTransaction = async (data: any) => {
        setIsSaving(true);
        setLoadingTransactionId(data.id);
        try {
            // Get the original transaction to calculate balance differences
            const originalTransaction = transactions.find(t => t.id === data.id);
            if (!originalTransaction) {
                throw new Error('Transaction not found');
            }

            // Update the transaction
            await offlineApi.updateTransaction(username, data.id, {
                type: data.type,
                amount: data.amount,
                category: data.category,
                description: data.description,
                date: data.date,
                wallet_id: data.walletId,
                tags: []
            });

            // Update wallet balances
            // Revert original transaction effect
            const originalWallet = wallets.find(w => w.id === originalTransaction.walletId);
            if (originalWallet) {
                const originalBalance = originalTransaction.type === 'income'
                    ? originalWallet.balance - originalTransaction.amount
                    : originalWallet.balance + originalTransaction.amount;
                await offlineApi.updateWallet(username, originalWallet.id, { balance: originalBalance });
            }

            // Apply new transaction effect
            const newWallet = wallets.find(w => w.id === data.walletId);
            if (newWallet) {
                const newBalance = data.type === 'income'
                    ? newWallet.balance + data.amount
                    : newWallet.balance - data.amount;
                await offlineApi.updateWallet(username, newWallet.id, { balance: newBalance });
            }

            // Update budget spent if category changed or amount changed
            if (originalTransaction.type === 'expense' || data.type === 'expense') {
                // If category changed, update both budgets
                if (originalTransaction.category !== data.category) {
                    // Remove from original budget
                    if (originalTransaction.type === 'expense') {
                        const originalBudget = budgets.find(b => b.category === originalTransaction.category);
                        if (originalBudget) {
                            await offlineApi.updateBudget(username, originalBudget.id, { spent: Math.max(0, originalBudget.spent - originalTransaction.amount) });
                        }
                    }

                    // Add to new budget
                    if (data.type === 'expense') {
                        const newBudget = budgets.find(b => b.category === data.category);
                        if (newBudget) {
                            await offlineApi.updateBudget(username, newBudget.id, { spent: newBudget.spent + data.amount });
                        }
                    }
                } else if (originalTransaction.amount !== data.amount || originalTransaction.type !== data.type) {
                    // Same category, just update the amount
                    const budget = budgets.find(b => b.category === data.category);
                    if (budget) {
                        let newSpent = budget.spent;
                        // Remove original amount
                        if (originalTransaction.type === 'expense') {
                            newSpent -= originalTransaction.amount;
                        }
                        // Add new amount
                        if (data.type === 'expense') {
                            newSpent += data.amount;
                        }
                        await offlineApi.updateBudget(username, budget.id, { spent: Math.max(0, newSpent) });
                    }
                }
            }

            await loadData();
            addToast('Transaction updated successfully', ToastType.SUCCESS);
            setEditingTransaction(null);
        } catch (error: any) {
            addToast(error.message || 'Failed to update transaction', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsSaving(false);
            setLoadingTransactionId(null);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        // Show confirmation modal
        setDeleteTransactionConfirm({
            isOpen: true,
            transactionId: id,
            transactionDesc: transaction.description
        });
    };

    const confirmDeleteTransaction = async () => {
        const id = deleteTransactionConfirm.transactionId;
        if (!id) return;

        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;

        setIsDeleting(true);
        setLoadingTransactionId(id);
        try {
            await offlineApi.deleteTransaction(username, id);

            // Revert wallet balance
            const wallet = wallets.find(w => w.id === transaction.walletId);
            if (wallet) {
                const newBalance = transaction.type === 'income'
                    ? wallet.balance - transaction.amount
                    : wallet.balance + transaction.amount;
                await offlineApi.updateWallet(username, wallet.id, { balance: newBalance });
            }

            // Revert budget spent
            if (transaction.type === 'expense') {
                const budget = budgets.find(b => b.category === transaction.category);
                if (budget) {
                    await offlineApi.updateBudget(username, budget.id, { spent: Math.max(0, budget.spent - transaction.amount) });
                }
            }

            await loadData();
            addToast('Transaction deleted', ToastType.SUCCESS);
            setDeleteTransactionConfirm({ isOpen: false, transactionId: null, transactionDesc: '' });
        } catch (error: any) {
            addToast(error.message || 'Failed to delete transaction', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsDeleting(false);
            setLoadingTransactionId(null);
        }
    };

    const handleSaveBudget = async (data: any) => {
        setIsSaving(true);
        if (editingBudget) {
            setLoadingBudgetId(editingBudget.id);
        }
        try {
            if (editingBudget) {
                await offlineApi.updateBudget(username, editingBudget.id, {
                    limit_amount: data.limit
                });
                addToast('Budget updated successfully!', ToastType.SUCCESS);
            } else {
                if (budgets.find(b => b.category === data.category)) {
                    throw new Error('Budget for this category already exists');
                }
                await offlineApi.addBudget(username, data.category, data.limit, data.period);
                addToast('Budget created successfully!', ToastType.SUCCESS);
            }
            await loadData();
        } catch (error: any) {
            addToast(error.message || 'Failed to save budget', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsSaving(false);
            if (editingBudget) {
                setLoadingBudgetId(null);
            }
        }
    };

    const handleDeleteBudget = async () => {
        if (!deleteConfirm.budgetId) return;
        setIsDeleting(true);
        setLoadingBudgetId(deleteConfirm.budgetId);
        try {
            await offlineApi.deleteBudget(username, deleteConfirm.budgetId);
            await loadData();
            addToast('Budget deleted successfully', ToastType.SUCCESS);
            setDeleteConfirm({ isOpen: false, budgetId: null, budgetName: '' });
        } catch (error: any) {
            addToast(error.message || 'Failed to delete budget', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsDeleting(false);
            setLoadingBudgetId(null);
        }
    };

    const handleAddGoal = async (data: any) => {
        setIsSaving(true);
        if (editingGoal) {
            setLoadingGoalId(editingGoal.id);
        }
        try {
            if (editingGoal) {
                await offlineApi.updateGoal(username, editingGoal.id, {
                    name: data.name,
                    target_amount: data.targetAmount,
                    deadline: data.deadline
                });
                addToast('Goal updated successfully!', ToastType.SUCCESS);
            } else {
                await offlineApi.addGoal(username, {
                    name: data.name,
                    target_amount: data.targetAmount,
                    saved_amount: 0,
                    deadline: data.deadline,
                    color: 'bg-indigo-500'
                });
                addToast('Goal created successfully!', ToastType.SUCCESS);
            }
            await loadData();
        } catch (error: any) {
            addToast(error.message || 'Failed to save goal', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsSaving(false);
            if (editingGoal) {
                setLoadingGoalId(null);
            }
        }
    };

    const handleContributeGoal = async (goalId: string, amount: number) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        try {
            const newSaved = Math.min(goal.savedAmount + amount, goal.targetAmount);
            await offlineApi.updateGoal(username, goalId, { saved_amount: newSaved });

            if (newSaved === goal.targetAmount) {
                addToast(`🎉 Goal "${goal.name}" achieved!`, ToastType.SUCCESS);
            } else {
                addToast('Contribution added!', ToastType.SUCCESS);
            }
            await loadData();
        } catch (error: any) {
            addToast(error.message || 'Failed to update goal', ToastType.ERROR);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        // Show confirmation modal
        setDeleteGoalConfirm({
            isOpen: true,
            goalId: id,
            goalName: goal.name
        });
    };

    const confirmDeleteGoal = async () => {
        const id = deleteGoalConfirm.goalId;
        if (!id) return;

        setIsDeleting(true);
        setLoadingGoalId(id);
        try {
            await offlineApi.deleteGoal(username, id);
            await loadData();
            addToast('Goal deleted', ToastType.SUCCESS);
            setDeleteGoalConfirm({ isOpen: false, goalId: null, goalName: '' });
        } catch (error: any) {
            addToast('Failed to delete goal', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsDeleting(false);
            setLoadingGoalId(null);
        }
    };

    const handleAddWallet = async (data: any) => {
        setIsSaving(true);
        if (editingWallet) {
            setLoadingWalletId(editingWallet.id);
        }
        try {
            if (editingWallet) {
                await offlineApi.updateWallet(username, editingWallet.id, {
                    name: data.name,
                    type: data.type,
                    balance: data.balance
                });
                addToast('Wallet updated successfully!', ToastType.SUCCESS);
            } else {
                const walletColors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-emerald-500'];
                await offlineApi.addWallet(username, {
                    ...data,
                    color: walletColors[wallets.length % walletColors.length]
                });
                addToast('Wallet created successfully!', ToastType.SUCCESS);
            }
            await loadData();
        } catch (error: any) {
            addToast(error.message || 'Failed to save wallet', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsSaving(false);
            if (editingWallet) {
                setLoadingWalletId(null);
            }
        }
    };

    const handleDeleteWallet = async (id: string) => {
        const wallet = wallets.find(w => w.id === id);
        if (!wallet) return;

        // Show confirmation modal
        setDeleteWalletConfirm({
            isOpen: true,
            walletId: id,
            walletName: wallet.name
        });
    };

    const confirmDeleteWallet = async () => {
        const id = deleteWalletConfirm.walletId;
        if (!id) return;

        setIsDeleting(true);
        setLoadingWalletId(id);
        try {
            await offlineApi.deleteWallet(username, id);
            await loadData();
            addToast('Wallet deleted', ToastType.SUCCESS);
            setDeleteWalletConfirm({ isOpen: false, walletId: null, walletName: '' });
        } catch (error: any) {
            addToast('Failed to delete wallet', ToastType.ERROR);
            await loadData(); // Ensure data is reloaded even on error
        } finally {
            setIsDeleting(false);
            setLoadingWalletId(null);
        }
    };

    // Tab Navigation Items
    const tabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
        { id: 'transactions', label: 'Transactions', icon: <Receipt className="w-4 h-4" /> },
        { id: 'budgets', label: 'Budgets', icon: <Target className="w-4 h-4" /> },
        { id: 'goals', label: 'Goals', icon: <Award className="w-4 h-4" /> },
        { id: 'wallets', label: 'Wallets', icon: <Wallet className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-4 pb-24 md:pb-8">
            {/* Desktop Tab Navigation */}
            <div className="hidden md:flex bg-white rounded-2xl p-2 shadow-sm border border-slate-100 gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl safe-area-pb">
                <div className="grid grid-cols-5 gap-1 px-2 py-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all min-h-[56px] ${activeTab === tab.id
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-slate-500 active:bg-slate-50'
                                }`}
                        >
                            <div className={`transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`}>
                                {React.cloneElement(tab.icon as React.ReactElement, { className: 'w-5 h-5' })}
                            </div>
                            <span className={`text-[10px] font-semibold leading-tight text-center ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-600'
                                }`}>
                                {tab.label === 'Transactions' ? 'Trans.' : tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <BudgetOverview
                        transactions={transactions}
                        wallets={wallets}
                        budgets={budgets}
                        goals={goals}
                        onNavigateToTransactions={() => setActiveTab('transactions')}
                    />
                )}

                {activeTab === 'transactions' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Transactions</h2>
                            <button
                                onClick={() => setIsAddingTransaction(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                + Add Transaction
                            </button>
                        </div>
                        <PaginatedTransactionList
                            transactions={transactions}
                            wallets={wallets}
                            onDelete={handleDeleteTransaction}
                            onEdit={(transaction) => {
                                setEditingTransaction(transaction);
                                setIsAddingTransaction(true);
                            }}
                            loadingTransactionId={loadingTransactionId}
                        />
                    </div>
                )}

                {activeTab === 'budgets' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Monthly Budgets</h2>
                            <button
                                onClick={() => {
                                    setEditingBudget(null);
                                    setIsAddingBudget(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                + Create Budget
                            </button>
                        </div>
                        <PaginatedBudgetList
                            budgets={budgets}
                            onEdit={(budget) => {
                                setEditingBudget(budget);
                                setIsAddingBudget(true);
                            }}
                            onDelete={(budget) => setDeleteConfirm({ isOpen: true, budgetId: budget.id, budgetName: budget.category })}
                            onCreate={() => {
                                setEditingBudget(null);
                                setIsAddingBudget(true);
                            }}
                            loadingBudgetId={loadingBudgetId}
                        />
                    </div>
                )}

                {activeTab === 'goals' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Savings Goals</h2>
                            <button
                                onClick={() => setIsAddingGoal(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                + New Goal
                            </button>
                        </div>
                        <PaginatedGoalList
                            goals={goals}
                            onContribute={handleContributeGoal}
                            onDelete={handleDeleteGoal}
                            onEdit={(goal) => {
                                setEditingGoal(goal);
                                setIsAddingGoal(true);
                            }}
                            onCreate={() => setIsAddingGoal(true)}
                            loadingGoalId={loadingGoalId}
                        />
                    </div>
                )}

                {activeTab === 'wallets' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">My Wallets</h2>
                            <button
                                onClick={() => setIsAddingWallet(true)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                + Add Wallet
                            </button>
                        </div>
                        <PaginatedWalletList
                            wallets={wallets}
                            onDelete={handleDeleteWallet}
                            onEdit={(wallet) => {
                                setEditingWallet(wallet);
                                setIsAddingWallet(true);
                            }}
                            onCreate={() => setIsAddingWallet(true)}
                            loadingWalletId={loadingWalletId}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddTransactionModal
                isOpen={isAddingTransaction}
                onClose={() => {
                    setIsAddingTransaction(false);
                    setEditingTransaction(null);
                }}
                onAdd={handleAddTransaction}
                onEdit={handleEditTransaction}
                wallets={wallets}
                isLoading={isSaving}
                editingTransaction={editingTransaction}
            />

            <AddBudgetModal
                isOpen={isAddingBudget}
                onClose={() => {
                    setIsAddingBudget(false);
                    setEditingBudget(null);
                }}
                onSave={handleSaveBudget}
                editingBudget={editingBudget}
                isLoading={isSaving}
            />

            <AddGoalModal
                isOpen={isAddingGoal}
                onClose={() => {
                    setIsAddingGoal(false);
                    setEditingGoal(null);
                }}
                onAdd={handleAddGoal}
                onEdit={handleAddGoal}
                editingGoal={editingGoal}
                isLoading={isSaving}
            />

            <AddWalletModal
                isOpen={isAddingWallet}
                onClose={() => {
                    setIsAddingWallet(false);
                    setEditingWallet(null);
                }}
                onAdd={handleAddWallet}
                onEdit={handleAddWallet}
                editingWallet={editingWallet}
                isLoading={isSaving}
            />

            <ConfirmModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ isOpen: false, budgetId: null, budgetName: '' })}
                onConfirm={handleDeleteBudget}
                title="Delete Budget"
                message={`Are you sure you want to delete the budget for "${deleteConfirm.budgetName}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            <ConfirmModal
                isOpen={deleteTransactionConfirm.isOpen}
                onClose={() => setDeleteTransactionConfirm({ isOpen: false, transactionId: null, transactionDesc: '' })}
                onConfirm={confirmDeleteTransaction}
                title="Delete Transaction"
                message={`Are you sure you want to delete the transaction "${deleteTransactionConfirm.transactionDesc}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            <ConfirmModal
                isOpen={deleteGoalConfirm.isOpen}
                onClose={() => setDeleteGoalConfirm({ isOpen: false, goalId: null, goalName: '' })}
                onConfirm={confirmDeleteGoal}
                title="Delete Goal"
                message={`Are you sure you want to delete the goal "${deleteGoalConfirm.goalName}"? This action cannot be undone.`}
                isLoading={isDeleting}
            />

            <ConfirmModal
                isOpen={deleteWalletConfirm.isOpen}
                onClose={() => setDeleteWalletConfirm({ isOpen: false, walletId: null, walletName: '' })}
                onConfirm={confirmDeleteWallet}
                title="Delete Wallet"
                message={`Are you sure you want to delete the wallet "${deleteWalletConfirm.walletName}"? All associated transactions will be preserved but wallet info will be lost.`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default BudgetTracker;