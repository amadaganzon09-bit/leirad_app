import React, { useState, useEffect } from 'react';
import { X, PieChart, Save, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../../../constants/budget';
import { Budget } from '../../../types/budget';

interface AddBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    editingBudget?: Budget | null;
    isLoading: boolean;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
    isOpen, onClose, onSave, editingBudget, isLoading
}) => {
    const [category, setCategory] = useState('Food');
    const [limit, setLimit] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        if (editingBudget) {
            setCategory(editingBudget.category);
            setLimit(editingBudget.limit.toString());
            setPeriod(editingBudget.period as 'weekly' | 'monthly' | 'yearly');
        } else {
            setCategory('Food');
            setLimit('');
            setPeriod('monthly');
        }
    }, [editingBudget, isOpen]);

    const handleSubmit = async () => {
        if (!limit) return;

        await onSave({
            category,
            limit: parseFloat(limit),
            period
        });

        if (!editingBudget) {
            setCategory('Food');
            setLimit('');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <PieChart className="w-5 h-5 text-indigo-600" />
                        </div>
                        {editingBudget ? 'Edit Budget' : `Create ${period.charAt(0).toUpperCase() + period.slice(1)} Budget`}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => setCategory(cat.name)}
                                    disabled={!!editingBudget}
                                    className={`p-2 rounded-xl border transition-all text-left flex items-center gap-2 ${category === cat.name
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        } ${!!editingBudget ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-1">
                                        {cat.icon}
                                        <span className="text-xs font-medium">{cat.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!!editingBudget && (
                            <p className="text-xs text-slate-500 mt-2">Category cannot be changed when editing</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{period.charAt(0).toUpperCase() + period.slice(1)} Limit</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-semibold"
                                placeholder="0.00"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Period Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Period</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setPeriod('weekly')}
                                className={`py-2 rounded-xl border transition-all text-center ${period === 'weekly'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setPeriod('monthly')}
                                className={`py-2 rounded-xl border transition-all text-center ${period === 'monthly'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setPeriod('yearly')}
                                className={`py-2 rounded-xl border transition-all text-center ${period === 'yearly'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                    }`}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{editingBudget ? 'Updating...' : 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{editingBudget ? 'Update Budget' : 'Create Budget'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBudgetModal;