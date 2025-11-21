import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-rose-100',
            icon: 'text-rose-600',
            button: 'bg-rose-600 hover:bg-rose-700'
        },
        warning: {
            bg: 'bg-amber-100',
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            bg: 'bg-blue-100',
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    const colorScheme = colors[type];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`${colorScheme.bg} p-3 rounded-xl`}>
                            <AlertTriangle className={`w-6 h-6 ${colorScheme.icon}`} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 leading-relaxed">{message}</p>
                </div>

                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-5 py-3 ${colorScheme.button} text-white rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
