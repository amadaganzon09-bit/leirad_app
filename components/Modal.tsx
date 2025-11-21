import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean; // Add isLoading prop
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  isDestructive = false,
  isLoading = false, // Default to false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 overflow-hidden ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;