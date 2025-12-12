import React, { useState, useEffect } from 'react';
import { X, KeyRound, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { AddToastFunction, ToastType } from '../types';
import { api } from '../utils/api';

interface ChangePasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  addToast: AddToastFunction;
}

const ChangePasscodeModal: React.FC<ChangePasscodeModalProps> = ({
  isOpen,
  onClose,
  username,
  addToast,
}) => {
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentPasscode('');
      setNewPasscode('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPasscode.length !== 6 || !/^\d+$/.test(newPasscode)) {
      addToast("New passcode must be exactly 6 digits.", ToastType.WARNING);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.updatePasscode(username, currentPasscode, newPasscode);
      addToast("Passcode updated successfully!", ToastType.SUCCESS);
      onClose();
    } catch (error: any) {
      console.error("Failed to update passcode", error);
      addToast(error.message || "Incorrect current passcode or server error.", ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform transition-all scale-100 opacity-100 overflow-hidden ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Change Passcode
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hidden username for accessibility/password managers */}
          <input
            type="text"
            name="username"
            value={username}
            autoComplete="username"
            className="hidden"
            readOnly
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              Current Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 tracking-widest font-mono transition-all"
                placeholder="••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
              New Passcode
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-800 tracking-widest font-mono transition-all"
                placeholder="••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <p className="text-xs text-gray-400 text-right">6 digits required</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || currentPasscode.length !== 6 || newPasscode.length !== 6}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all active:scale-95 ${isSubmitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Passcode
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasscodeModal;