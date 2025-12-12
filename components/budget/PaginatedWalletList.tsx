import React, { useState, useEffect } from 'react';
import { Wallet, Trash2, Edit2, Loader2 } from 'lucide-react';
import { WalletType } from '../../types/budget';

interface PaginatedWalletListProps {
    wallets: WalletType[];
    onDelete: (id: string) => void;
    onEdit: (wallet: WalletType) => void;
    onCreate: () => void;
    loadingWalletId?: string | null;
}

const PaginatedWalletList: React.FC<PaginatedWalletListProps> = ({
    wallets, onDelete, onEdit, onCreate, loadingWalletId
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [wallets]);

    // Pagination
    const totalPages = Math.ceil(wallets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedWallets = wallets.slice(startIndex, startIndex + itemsPerPage);

    if (wallets.length === 0) {
        return (
            <div className="col-span-full text-center py-10 text-slate-400">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No wallets found</p>
                <button
                    onClick={onCreate}
                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                    Add your first wallet
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paginatedWallets.map((wallet) => (
                    <div key={wallet.id} className={`${wallet.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all relative group`}>
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-md">
                                {wallet.icon}
                            </div>
                            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(wallet);
                                    }}
                                    disabled={loadingWalletId === wallet.id}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Edit wallet"
                                >
                                    {loadingWalletId === wallet.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                        <Edit2 className="w-4 h-4 text-white" />
                                    )}
                                </button>
                                {wallet.id !== 'default' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(wallet.id);
                                        }}
                                        disabled={loadingWalletId === wallet.id}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete wallet"
                                    >
                                        {loadingWalletId === wallet.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 text-white" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg mb-1">{wallet.name}</h4>
                            <p className="text-xs opacity-80 capitalize mb-4 font-medium">{wallet.type}</p>
                            <div className="text-3xl font-bold mb-1">₱{wallet.balance.toFixed(2)}</div>
                            <div className="text-sm opacity-90 font-medium">Current balance</div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pagination Controls */}
            {wallets.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    
                    <div className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
                        disabled={currentPage === (totalPages || 1)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaginatedWalletList;