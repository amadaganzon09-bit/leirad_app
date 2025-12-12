import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastData, ToastType } from '../types';

interface ToastProps {
  toast: ToastData;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  // Handle auto-dismiss
  useEffect(() => {
    const duration = toast.duration || 3000;
    
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    // Allow exit animation to play before actually removing
    let removeTimer: ReturnType<typeof setTimeout> | undefined;
    if (isExiting) {
      removeTimer = setTimeout(() => {
        onClose(toast.id);
      }, 300); // Match transition duration
    }

    return () => {
      clearTimeout(timer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [toast, onClose, isExiting]);

  const handleCloseClick = () => {
    setIsExiting(true);
  };

  // Icon selection based on type
  const getIcon = () => {
    switch (toast.type) {
      case ToastType.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ToastType.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case ToastType.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case ToastType.INFO:
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Border color based on type
  const getBorderColor = () => {
    switch (toast.type) {
      case ToastType.SUCCESS: return 'border-green-500';
      case ToastType.ERROR: return 'border-red-500';
      case ToastType.WARNING: return 'border-yellow-500';
      case ToastType.INFO: return 'border-blue-500';
      default: return 'border-gray-200';
    }
  };

  return (
    <div
      className={`
        flex items-center w-full max-w-xs p-4 mb-4 text-gray-800 bg-white rounded-lg shadow-lg border-l-4
        ${getBorderColor()}
        transition-all duration-300 ease-in-out transform
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {getIcon()}
      </div>
      <div className="ml-3 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        onClick={handleCloseClick}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center transition-colors"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;