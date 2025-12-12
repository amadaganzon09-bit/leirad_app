import React from 'react';
import { Wallet, Trash2, Edit2, Loader2 } from 'lucide-react';
import { WalletType } from '../../types/budget';

interface WalletListProps {
    wallets: WalletType[];
    onDelete: (id: string) => void;
    onEdit: (wallet: WalletType) => void;
    onCreate: () => void;
    loadingWalletId?: string | null; // Add loading state for wallet operations
}

const WalletList: React.FC<WalletListProps> = ({
    wallets, onDelete, onEdit, onCreate, loadingWalletId
}) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
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
    );
};

export default WalletList;