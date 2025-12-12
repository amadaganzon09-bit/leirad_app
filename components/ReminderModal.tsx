
import React from 'react';
import { X, BellRing, CalendarClock, ArrowRight } from 'lucide-react';
import { Todo } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Todo[];
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, tasks }) => {
  if (!isOpen || tasks.length === 0) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-500">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100 overflow-hidden ring-1 ring-black/5 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative header background */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-100 to-orange-50 opacity-50 z-0"></div>

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full shadow-sm ring-4 ring-amber-50">
                    <BellRing className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Heads Up!</h3>
                    <p className="text-sm text-gray-500 font-medium">You have tasks due tomorrow</p>
                </div>
             </div>
             <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white/50 rounded-lg backdrop-blur-sm"
             >
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-xl max-h-[60vh] overflow-y-auto shadow-inner">
            <ul className="divide-y divide-gray-100">
                {tasks.map((task) => (
                    <li key={task.id} className="p-4 hover:bg-amber-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                            <CalendarClock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-800 font-medium truncate">{task.text}</p>
                                {task.dueDate && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        Due at <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{formatTime(task.dueDate)}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
          </div>

          <div className="mt-6 flex justify-end">
             <button
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
             >
                <span>Got it, thanks</span>
                <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
