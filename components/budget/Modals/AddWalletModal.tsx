import React, { useState, useEffect } from 'react';
import { X, Wallet, Save, Loader2 } from 'lucide-react';
import { WalletType } from '../../../types/budget';
import { WALLET_ICONS } from '../../../constants/budget';

interface AddWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<void>;
    onEdit?: (data: any) => Promise<void>; // Add onEdit prop
    editingWallet?: WalletType | null; // Add editingWallet prop
    isLoading: boolean; // Add isLoading prop
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({
    isOpen, onClose, onAdd, onEdit, editingWallet, isLoading
}) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'cash' | 'debit' | 'credit' | 'digital'>('cash');
    const [balance, setBalance] = useState('');

    // Update form fields when editing a wallet
    useEffect(() => {
        if (editingWallet) {
            setName(editingWallet.name);
            setType(editingWallet.type);
            setBalance(editingWallet.balance.toString());
        } else {
            // Reset form when not editing
            setName('');
            setType('cash');
            setBalance('');
        }
    }, [editingWallet, isOpen]);

    const handleSubmit = async () => {
        if (!name) return;

        const data = {
            name,
            type,
            balance: balance ? parseFloat(balance) : 0,
            color: editingWallet?.color || 'bg-indigo-500' // Use existing color when editing
        };

        if (editingWallet && onEdit) {
            // Editing existing wallet
            await onEdit({ ...data, id: editingWallet.id });
        } else {
            // Adding new wallet
            await onAdd(data);
        }

        setName('');
        setType('cash');
        setBalance('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Wallet className="w-5 h-5 text-indigo-600" />
                        </div>
                        {editingWallet ? 'Edit Wallet' : 'Add New Wallet'}
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="e.g., Savings Account"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wallet Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['cash', 'debit', 'credit', 'digital'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    disabled={!!editingWallet} // Disable type change when editing
                                    className={`p-3 rounded-xl border-2 transition-all capitalize ${type === t
                                        ? 'bg-indigo-600 text-white border-transparent shadow-lg'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                        } ${!!editingWallet ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        {WALLET_ICONS[t]}
                                        <span className="text-sm font-medium">{t}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {!!editingWallet && (
                            <p className="text-xs text-slate-500 mt-2">Wallet type cannot be changed when editing</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Balance (Optional)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-semibold"
                                placeholder="0.00"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{editingWallet ? 'Updating...' : 'Add Wallet'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{editingWallet ? 'Update Wallet' : 'Add Wallet'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddWalletModal;