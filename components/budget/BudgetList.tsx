import React, { useState } from 'react';
import { PieChart, Edit2, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Budget } from '../../types/budget';

interface BudgetListProps {
    budgets: Budget[];
    onEdit: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    onCreate: () => void;
    loadingBudgetId?: string | null; // Add loading state for budget operations
}

const BudgetList: React.FC<BudgetListProps> = ({
    budgets, onEdit, onDelete, onCreate, loadingBudgetId
}) => {
    if (budgets.length === 0) {
        return (
            <div className="col-span-full text-center py-10 text-slate-400">
                <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No budgets created yet</p>
                <button
                    onClick={onCreate}
                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                    Create your first budget
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                const isNearLimit = percentage > 80 && percentage <= 100;
                const remaining = budget.limit - budget.spent;

                return (
                    <div key={budget.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                        {/* Progress Bar Background */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100">
                            <div
                                className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${budget.color} text-white shadow-md`}>
                                    {budget.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">{budget.category}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{budget.period}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(budget);
                                    }}
                                    disabled={loadingBudgetId === budget.id}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Edit budget"
                                >
                                    {loadingBudgetId === budget.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Edit2 className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(budget);
                                    }}
                                    disabled={loadingBudgetId === budget.id}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete budget"
                                >
                                    {loadingBudgetId === budget.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-bold text-slate-800">₱{budget.spent.toFixed(2)}</span>
                                <span className="text-sm font-medium text-slate-500 mb-1">of ₱{budget.limit.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium">
                                <span className={`${isOverBudget ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {percentage.toFixed(1)}% used
                                </span>
                                <span className="text-slate-400">
                                    {remaining < 0 ? `Over by ₱${Math.abs(remaining).toFixed(2)}` : `₱${remaining.toFixed(2)} left`}
                                </span>
                            </div>
                        </div>

                        {isOverBudget && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2.5 rounded-xl">
                                <AlertCircle className="w-4 h-4" />
                                <span>Budget limit exceeded</span>
                            </div>
                        )}
                        {isNearLimit && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2.5 rounded-xl">
                                <AlertCircle className="w-4 h-4" />
                                <span>Approaching limit</span>
                            </div>
                        )}
                        {!isOverBudget && !isNearLimit && (
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2.5 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>On track</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BudgetList;