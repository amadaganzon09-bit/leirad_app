
import React, { useState } from 'react';
import { X, Target, Calendar, Flag, ArrowRight, Clock } from 'lucide-react';
import { Todo, Priority } from '../types';

interface FocusSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Todo[];
  onSelect: (id: string) => void;
}

const FocusSelectModal: React.FC<FocusSelectModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Sort tasks: High priority first, then overdue/due soon
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityScore = (p: Priority) => (p === 'high' ? 3 : p === 'medium' ? 2 : 1);
    const scoreA = priorityScore(a.priority);
    const scoreB = priorityScore(b.priority);
    
    if (scoreA !== scoreB) return scoreB - scoreA;
    return (a.dueDate || Infinity) - (b.dueDate || Infinity);
  });

  const filteredTasks = sortedTasks.filter(t => 
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (p: Priority) => {
    switch(p) {
        case 'high': return 'text-rose-600 bg-rose-50 border-rose-100';
        case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'low': return 'text-blue-600 bg-blue-50 border-blue-100';
        default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden ring-1 ring-white/20"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Target className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Enter Focus Mode</h3>
                <p className="text-sm text-slate-500">Select a task to work on exclusively</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search (Optional, for many tasks) */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
             <input 
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
             />
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50 custom-scrollbar">
           {filteredTasks.length === 0 ? (
               <div className="text-center py-12 opacity-60">
                   <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Target className="w-8 h-8 text-slate-400" />
                   </div>
                   <p className="font-medium text-slate-500">No active tasks found to focus on.</p>
               </div>
           ) : (
               filteredTasks.map(task => (
                   <button
                        key={task.id}
                        onClick={() => onSelect(task.id)}
                        className="w-full group flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
                   >
                       {/* Priority Indicator */}
                       <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${getPriorityColor(task.priority)}`}>
                           <Flag className="w-5 h-5" />
                       </div>

                       {/* Content */}
                       <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">{task.text}</h4>
                           <div className="flex items-center gap-3 mt-1">
                                {task.dueDate && (
                                    <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                           </div>
                       </div>

                       {/* Action Arrow */}
                       <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                       </div>
                   </button>
               ))
           )}
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
            Selecting a task will hide all other distractions.
        </div>
      </div>
    </div>
  );
};

export default FocusSelectModal;
