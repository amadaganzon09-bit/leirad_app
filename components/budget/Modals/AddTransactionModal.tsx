import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Save, Loader2 } from 'lucide-react';
import { WalletType, Transaction } from '../../../types/budget';
import { CATEGORIES } from '../../../constants/budget';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<void>;
    onEdit?: (data: any) => Promise<void>; // Add onEdit prop
    wallets: WalletType[];
    isLoading: boolean;
    editingTransaction?: Transaction | null; // Add editingTransaction prop
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    isOpen, onClose, onAdd, onEdit, wallets, isLoading, editingTransaction
}) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [description, setDescription] = useState('');
    const [walletId, setWalletId] = useState('');

    // Update form fields when editing a transaction
    useEffect(() => {
        if (editingTransaction) {
            setType(editingTransaction.type as 'income' | 'expense');
            setAmount(editingTransaction.amount.toString());
            setCategory(editingTransaction.category);
            setDescription(editingTransaction.description);
            setWalletId(editingTransaction.walletId);
        } else {
            // Reset form when not editing
            setType('expense');
            setAmount('');
            setCategory('Food');
            setDescription('');
            if (wallets.length > 0) {
                setWalletId(wallets[0].id);
            }
        }
    }, [editingTransaction, wallets]);

    const handleSubmit = async () => {
        if (!amount || !description || !walletId) return;

        const data = {
            type,
            amount: parseFloat(amount),
            category,
            description,
            walletId,
            date: editingTransaction ? editingTransaction.date : new Date().toISOString()
        };

        if (editingTransaction && onEdit) {
            // Editing existing transaction
            await onEdit({ ...data, id: editingTransaction.id });
        } else {
            // Adding new transaction
            await onAdd(data);
        }

        // Reset form
        setType('expense');
        setAmount('');
        setDescription('');
        setCategory('Food');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className={`p-2 ${type === 'income' ? 'bg-emerald-100' : 'bg-rose-100'} rounded-xl`}>
                            {type === 'income' ? (
                                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <ArrowDownRight className="w-5 h-5 text-rose-600" />
                            )}
                        </div>
                        {editingTransaction ? 'Edit Transaction' : type === 'income' ? 'New Income' : 'New Expense'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense'
                                ? 'bg-white text-rose-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-semibold"
                                placeholder="0.00"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.name}
                                    onClick={() => setCategory(cat.name)}
                                    className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${category === cat.name
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-100 hover:border-slate-200 text-slate-600'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${cat.color} text-white`}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-sm font-medium">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="What is this for?"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Wallet */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet</label>
                        <select
                            value={walletId}
                            onChange={(e) => setWalletId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none"
                            disabled={isLoading}
                        >
                            {wallets.map(wallet => (
                                <option key={wallet.id} value={wallet.id}>
                                    {wallet.name} (₱{wallet.balance.toFixed(2)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`w-full py-3.5 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 ${type === 'income'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{editingTransaction ? 'Updating...' : 'Save Transaction'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{editingTransaction ? 'Update Transaction' : 'Save Transaction'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;