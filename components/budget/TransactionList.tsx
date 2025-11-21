import React, { useState } from 'react';
import { Search, Receipt, Trash2, DollarSign } from 'lucide-react';
import { Transaction, WalletType } from '../../types/budget';
import { CATEGORIES } from '../../constants/budget';

interface TransactionListProps {
    transactions: Transaction[];
    wallets: WalletType[];
    onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
    transactions, wallets, onDelete
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesCategory && matchesType;
    });

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm font-medium text-slate-700"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                    >
                        Income
                    </button>
                    <button
                        onClick={() => setFilterType('expense')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'expense' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500'}`}
                    >
                        Expense
                    </button>
                </div>
            </div>

            {/* Transactions Timeline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50 text-slate-400" />
                        <p className="text-slate-500">No transactions found</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {filteredTransactions.map((transaction, index) => {
                            const categoryInfo = CATEGORIES.find(c => c.name === transaction.category);
                            const wallet = wallets.find(w => w.id === transaction.walletId);
                            const isLast = index === filteredTransactions.length - 1;

                            return (
                                <div key={transaction.id} className="relative flex gap-3 pb-4 group">
                                    {/* Timeline Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${categoryInfo?.color || 'bg-slate-500'} text-white flex items-center justify-center shadow-sm z-10`}>
                                            {categoryInfo?.icon || <DollarSign className="w-5 h-5" />}
                                        </div>
                                        {!isLast && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-slate-200 to-transparent mt-2" />
                                        )}
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="flex-1 pt-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm sm:text-base font-semibold text-slate-800 truncate">{transaction.description}</p>
                                                <p className="text-xs text-slate-500">{transaction.category}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`font-bold text-sm sm:text-base whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => onDelete(transaction.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95 md:opacity-0 md:group-hover:opacity-100"
                                                    title="Delete transaction"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>
                                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {wallet && (
                                                <>
                                                    <span>•</span>
                                                    <span>{wallet.name}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionList;
