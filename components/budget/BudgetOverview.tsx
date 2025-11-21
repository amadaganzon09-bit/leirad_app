import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, DollarSign } from 'lucide-react';
import { Transaction, WalletType, Budget, Goal } from '../../types/budget';
import { CATEGORIES } from '../../constants/budget';

interface BudgetOverviewProps {
    transactions: Transaction[];
    wallets: WalletType[];
    budgets: Budget[];
    goals: Goal[];
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
    transactions, wallets, budgets, goals
}) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    // Calculate total savings from goals
    const totalSavings = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    return (
        <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Balance</span>
                    </div>
                    <p className="text-xl font-bold">₱{totalBalance.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Income</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">₱{totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-rose-600">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium">Expenses</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">₱{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium">Savings</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">₱{totalSavings.toFixed(2)}</p>
                </div>
            </div>

            {/* Recent Transactions & Budget Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recent Activity - Timeline */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-indigo-600" />
                        Recent Activity
                    </h3>
                    <div className="space-y-0">
                        {transactions.slice(0, 5).map((transaction, index) => {
                            const categoryInfo = CATEGORIES.find(c => c.name === transaction.category);
                            const isLast = index === Math.min(transactions.length, 5) - 1;

                            return (
                                <div key={transaction.id} className="relative flex gap-3 pb-4">
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-xl ${categoryInfo?.color || 'bg-slate-500'} text-white flex items-center justify-center shadow-sm z-10`}>
                                            {categoryInfo?.icon || <DollarSign className="w-5 h-5" />}
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-slate-200 to-transparent mt-2" />
                                        )}
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="flex-1 pt-1">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{transaction.description}</p>
                                                <p className="text-xs text-slate-500">{transaction.category}</p>
                                            </div>
                                            <span className={`font-bold text-sm whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            {new Date(transaction.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {transactions.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">No recent transactions</p>
                        )}
                    </div>
                </div>

                {/* Budget Status */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Budget Status
                    </h3>
                    <div className="space-y-4">
                        {budgets.slice(0, 4).map((budget) => {
                            const percentage = (budget.spent / budget.limit) * 100;
                            const isOverBudget = percentage > 100;
                            return (
                                <div key={budget.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">{budget.category}</span>
                                        <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-600'}`}>
                                            {percentage.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {budgets.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">No budgets set</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetOverview;
