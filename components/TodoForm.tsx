
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Loader2, X, Briefcase, BookOpen, User, Heart, DollarSign, Layers, CalendarClock, ChevronDown, Check } from 'lucide-react';
import { AddToastFunction, ToastType, Priority, Category } from '../types';

interface TodoFormProps {
    onAdd: (text: string, dueDate: number | undefined, priority: Priority, category: Category) => void;
    addToast: AddToastFunction;
    autoFocus?: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAdd, addToast, autoFocus = false }) => {
    const [input, setInput] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [category, setCategory] = useState<Category>('general');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) {
            addToast("Please enter a task description.", ToastType.WARNING);
            return;
        }

        setIsSubmitting(true);

        // Simulate network request/processing time for better UX feedback
        await new Promise(resolve => setTimeout(resolve, 500));

        let timestamp: number | undefined;
        if (dueDate) {
            const dateObj = new Date(dueDate);
            if (!isNaN(dateObj.getTime())) {
                timestamp = dateObj.getTime();
            }
        }

        onAdd(input.trim(), timestamp, priority, category);
        setInput('');
        setDueDate('');
        setPriority('medium');
        setCategory('general');
        setIsExpanded(false);
        setIsSubmitting(false);
        setIsCategoryOpen(false);
    };

    const clearDate = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDueDate('');
    };

    const getFormattedDate = () => {
        if (!dueDate) return '';
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) return 'Invalid Date';

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.toDateString() === now.toDateString();
        const isTomorrow = date.toDateString() === tomorrow.toDateString();

        const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

        if (isToday) return `Today • ${time}`;
        if (isTomorrow) return `Tomorrow • ${time}`;

        const day = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return `${day} • ${time}`;
    };

    // Robust manual formatting to avoid timezone issues with toISOString
    const getMinDateTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const categories: { id: Category; label: string; icon: React.ReactNode; color: string }[] = [
        { id: 'general', label: 'General', icon: <Layers className="w-4 h-4" />, color: 'bg-gray-100 text-gray-600' },
        { id: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'bg-slate-100 text-slate-600' },
        { id: 'study', label: 'Study', icon: <BookOpen className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600' },
        { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-600' },
        { id: 'health', label: 'Health', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-100 text-rose-600' },
        { id: 'finance', label: 'Finance', icon: <DollarSign className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600' },
    ];

    const activeCategory = categories.find(c => c.id === category);

    return (
        <form onSubmit={handleSubmit} className="relative group z-30">
            {/* CSS to expand the calendar click target to 100% of the input */}
            <style>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          color: transparent;
          background: transparent;
          cursor: pointer;
        }
      `}</style>

            <div className={`
        relative flex flex-col bg-white rounded-3xl shadow-xl shadow-indigo-500/10 border border-slate-100
        transition-all duration-300 overflow-visible
        ${isExpanded || input || autoFocus ? 'pb-3 scale-100 ring-4 ring-indigo-500/10' : 'pb-0 scale-[0.99] hover:scale-100'}
      `}>

                {/* Top Row: Input */}
                <div className="flex items-center p-2 pr-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            autoFocus={autoFocus}
                            onFocus={() => setIsExpanded(true)}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="What needs to be done?"
                            disabled={isSubmitting}
                            className="w-full pl-5 py-4 text-lg bg-transparent border-none focus:ring-0 focus:outline-none placeholder-slate-400 text-slate-900 font-medium disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !input.trim()}
                        className={`
                    h-12 w-12 rounded-2xl transition-all duration-300 flex-shrink-0 flex items-center justify-center ml-2
                    ${isSubmitting || !input.trim()
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-105 active:scale-95'
                            }
                `}
                        aria-label="Add Task"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Plus className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Bottom Row: Metadata Controls (Collapsible) */}
                <div className={`
            px-5 flex flex-wrap items-center gap-2 transition-all duration-300 origin-top relative
            ${isExpanded || input || autoFocus ? 'opacity-100 max-h-40 translate-y-0' : 'opacity-0 max-h-0 -translate-y-4 pointer-events-none'}
        `}>

                    {/* Pill 1: Date Picker */}
                    <div className="relative group/date">
                        <div className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer select-none
                    ${dueDate
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 hover:shadow-sm'}
                `}>
                            <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                                {dueDate ? getFormattedDate() : 'Set Due Date'}
                            </span>
                            {dueDate && (
                                <button
                                    type="button"
                                    onClick={clearDate}
                                    className="ml-1 p-0.5 hover:bg-indigo-100 rounded-full text-indigo-400 hover:text-indigo-700 z-20 relative"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Invisible Input Overlay */}
                        <input
                            type="datetime-local"
                            value={dueDate}
                            min={getMinDateTime()}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={isSubmitting}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                            aria-label="Select due date"
                        />
                    </div>

                    {/* Pill 2: Category Custom Dropdown (Now Modal) */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsCategoryOpen(true)}
                            className={`
                        flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer select-none border
                        ${isCategoryOpen
                                    ? 'bg-white border-indigo-200 text-slate-800 ring-2 ring-indigo-50'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 hover:shadow-sm'}
                    `}
                        >
                            {/* Colored Icon Container in Trigger */}
                            <div className={`p-1 rounded-full ${activeCategory?.color || 'bg-gray-100 text-gray-500'}`}>
                                {activeCategory?.icon && React.isValidElement(activeCategory.icon)
                                    ? React.cloneElement(activeCategory.icon as React.ReactElement<{ className?: string }>, { className: "w-3.5 h-3.5" })
                                    : activeCategory?.icon}
                            </div>

                            <span>{activeCategory?.label}</span>
                            <ChevronDown className={`w-3 h-3 ml-0.5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                        </button>

                        {/* Category Selection Modal (Portal) */}
                        {isCategoryOpen && createPortal(
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                {/* Backdrop click handler */}
                                <div className="absolute inset-0" onClick={() => setIsCategoryOpen(false)}></div>

                                <div
                                    className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100"
                                    role="dialog"
                                    aria-modal="true"
                                >
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <h3 className="font-bold text-slate-800 text-lg">Select Category</h3>
                                        <button
                                            onClick={() => setIsCategoryOpen(false)}
                                            className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    setCategory(cat.id);
                                                    setIsCategoryOpen(false);
                                                }}
                                                className={`
                                            flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 group
                                            ${category === cat.id
                                                        ? 'border-indigo-600 bg-indigo-50/50'
                                                        : 'border-transparent bg-slate-50 hover:bg-slate-100 hover:scale-[1.02] hover:shadow-md'}
                                        `}
                                            >
                                                <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${cat.color} ${category === cat.id ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}>
                                                    {React.cloneElement(cat.icon as React.ReactElement, { className: "w-6 h-6" })}
                                                </div>
                                                <span className={`font-bold text-sm ${category === cat.id ? 'text-indigo-900' : 'text-slate-600'}`}>
                                                    {cat.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>

                    <div className="w-px h-4 bg-slate-200 mx-1"></div>

                    {/* Pill 3: Priority */}
                    <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-0.5">
                        {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p)}
                                className={`
                            px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-200
                            ${priority === p
                                        ? p === 'high' ? 'bg-white text-rose-600 shadow-sm ring-1 ring-rose-100'
                                            : p === 'medium' ? 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-100'
                                                : 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}
                        `}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                </div>
            </div>
        </form>
    );
};

export default TodoForm;
