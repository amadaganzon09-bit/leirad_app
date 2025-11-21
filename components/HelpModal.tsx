import React from 'react';
import { X, CheckCircle2, Plus, Trash2, Calendar, Settings, MousePointerClick, CheckSquare, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 opacity-100 ring-1 ring-black/5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur">
          <h3 className="text-xl font-bold text-gray-800">How to use TaskMaster</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
            
            {/* Section 1: Basics */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2">Getting Started</h4>
                
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg h-fit">
                            <Plus className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Add Tasks</h5>
                            <p className="text-sm text-gray-500 mt-1">Type your task description. Use the calendar icon to set a specific due date and time (current or future only).</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg h-fit">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Complete Tasks</h5>
                            <p className="text-sm text-gray-500 mt-1">Click the circle checkbox to mark a task as done. A confirmation popup will appear to celebrate your win!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Management */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2">Managing Your List</h4>
                
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                            <MousePointerClick className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Edit Items</h5>
                            <p className="text-sm text-gray-500 mt-1">Hover over a task and click the Pencil icon to edit text. Press Enter to save or Esc to cancel.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg h-fit">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Delete Items</h5>
                            <p className="text-sm text-gray-500 mt-1">Click the Trash icon to remove a task. We'll always ask for confirmation first to prevent mistakes.</p>
                        </div>
                    </div>
                </div>
            </div>

             {/* Section 3: Advanced */}
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider border-b border-gray-100 pb-2">Advanced Features</h4>
                
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg h-fit">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Bulk Actions</h5>
                            <p className="text-sm text-gray-500 mt-1">Click "Select" to enter selection mode. Choose multiple tasks to delete, complete, or reschedule them all at once.</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg h-fit">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Smart Sorting</h5>
                            <p className="text-sm text-gray-500 mt-1">Tasks are automatically organized into Overdue, Today, Upcoming, and Inbox sections.</p>
                        </div>
                    </div>
                    
                     <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 text-gray-600 rounded-lg h-fit">
                            <Settings className="w-5 h-5" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800">Settings</h5>
                            <p className="text-sm text-gray-500 mt-1">Click the cog icon in the header to change your secure 6-digit passcode.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;