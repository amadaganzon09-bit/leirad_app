
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Edit2, Check, X, Save, CalendarClock, Square, CheckSquare, Loader2, History, Flag, Briefcase, BookOpen, User, Heart, DollarSign, Layers, Undo2, MoreVertical } from 'lucide-react';
import { Todo, Category, Priority } from '../types';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newText: string) => void;
    isSelectionMode: boolean;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
    todo,
    onToggle,
    onDelete,
    onEdit,
    isSelectionMode,
    isSelected,
    onSelect
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const editInputRef = useRef<HTMLInputElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setShowMobileMenu(false);
            }
        };

        if (showMobileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMobileMenu]);

    const handleSave = async () => {
        if (editText.trim()) {
            setIsSaving(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            onEdit(todo.id, editText.trim());
            setIsSaving(false);
            setIsEditing(false);
        } else {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    const handleDelete = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setShowMobileMenu(false);
        onDelete(todo.id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMobileMenu(false);
        setIsEditing(true);
    };

    const handleItemClick = () => {
        if (isSelectionMode) {
            onSelect(todo.id);
        }
    };

    const formatFullDateTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    const getCategoryIcon = (cat: Category) => {
        switch (cat) {
            case 'work': return <Briefcase className="w-3 h-3" />;
            case 'study': return <BookOpen className="w-3 h-3" />;
            case 'personal': return <User className="w-3 h-3" />;
            case 'health': return <Heart className="w-3 h-3" />;
            case 'finance': return <DollarSign className="w-3 h-3" />;
            default: return <Layers className="w-3 h-3" />;
        }
    };

    const getCategoryStyle = (cat: Category) => {
        switch (cat) {
            case 'work': return 'text-slate-600 bg-slate-100';
            case 'study': return 'text-purple-600 bg-purple-50';
            case 'personal': return 'text-emerald-600 bg-emerald-50';
            case 'health': return 'text-rose-600 bg-rose-50';
            case 'finance': return 'text-amber-600 bg-amber-50';
            default: return 'text-gray-500 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: Priority) => {
        if (todo.completed) return 'bg-gray-200';
        switch (priority) {
            case 'high': return 'bg-rose-500 shadow-sm shadow-rose-200';
            case 'medium': return 'bg-amber-400';
            case 'low': return 'bg-blue-400';
            default: return 'bg-gray-300';
        }
    };

    // Fallback for old data
    const priority = todo.priority || 'medium';
    const category = todo.category || 'general';

    const isOverdue = todo.dueDate ? todo.dueDate < Date.now() && !todo.completed : false;
    const isDueToday = todo.dueDate ? new Date(todo.dueDate).toDateString() === new Date().toDateString() && !todo.completed : false;

    return (
        <div
            onClick={handleItemClick}
            className={`
        group relative flex items-stretch rounded-2xl transition-all duration-300 ease-out
        ${isSelectionMode ? 'cursor-pointer' : ''}
        ${isSelected
                    ? 'bg-indigo-50/90 ring-2 ring-indigo-500 shadow-md transform scale-[1.01] z-10'
                    : todo.completed
                        ? 'bg-slate-50/60 border border-transparent hover:bg-white hover:shadow-sm'
                        : 'bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-slate-100 hover:border-indigo-100'
                }
      `}
        >
            {/* Left Border for Priority (Only for active tasks) */}
            {!todo.completed && (
                <div className={`w-1.5 rounded-l-2xl ${getPriorityColor(priority)}`}></div>
            )}

            <div className={`flex-1 flex items-center p-4 pl-3 min-w-0 ${todo.completed ? 'pl-5' : ''}`}>
                {isEditing ? (
                    <div className="flex-1 flex items-center gap-3 animate-in fade-in duration-200">
                        <div className="flex-1 relative">
                            <input
                                ref={editInputRef}
                                type="text"
                                disabled={isSaving}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full p-2 pl-0 text-slate-900 border-b-2 border-indigo-500 focus:outline-none bg-transparent text-lg font-medium"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Checkbox Area */}
                        <div className="relative flex items-center justify-center mr-4 flex-shrink-0">
                            {isSelectionMode ? (
                                <div className={`transition-all duration-300 transform ${isSelected ? 'text-indigo-600 scale-110' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                                    {isSelected ? <CheckSquare className="w-6 h-6 fill-indigo-50" /> : <Square className="w-6 h-6" />}
                                </div>
                            ) : (
                                <div
                                    onClick={() => onToggle(todo.id)}
                                    className="relative w-6 h-6 cursor-pointer group/check"
                                >
                                    {/* Custom Checkbox Visuals */}
                                    <div className={`
                            w-6 h-6 rounded-full border-2 transition-all duration-300 ease-out flex items-center justify-center
                            ${todo.completed
                                            ? 'bg-emerald-500 border-emerald-500 scale-100'
                                            : 'bg-transparent border-slate-300 hover:border-indigo-400'
                                        }
                        `}>
                                        <Check
                                            className={`
                                    w-3.5 h-3.5 text-white stroke-[3]
                                    transition-all duration-300
                                    ${todo.completed ? 'opacity-100 scale-100 animate-pop-in' : 'opacity-0 scale-50'}
                                `}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="flex flex-col flex-1 min-w-0 py-0.5">
                            <span
                                onClick={(e) => {
                                    if (!isSelectionMode) {
                                        onToggle(todo.id);
                                        e.stopPropagation();
                                    }
                                }}
                                className={`
                    text-base transition-all duration-300 whitespace-pre-wrap break-words leading-normal
                    ${isSelectionMode ? '' : 'cursor-pointer select-none'}
                    ${todo.completed
                                        ? 'text-slate-500 line-through decoration-slate-300 decoration-2'
                                        : 'text-slate-900 font-medium'}
                `}
                            >
                                {todo.text}
                            </span>

                            {/* Metadata Row */}
                            <div className={`flex flex-wrap items-center gap-3 mt-2.5 transition-opacity duration-300 ${todo.completed ? 'opacity-60 grayscale' : 'opacity-100'}`}>

                                {/* Category Pill */}
                                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${getCategoryStyle(category)}`}>
                                    {getCategoryIcon(category)}
                                    <span>{category}</span>
                                </div>

                                {/* Priority Text (Active High Only) */}
                                {!todo.completed && priority === 'high' && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                                        <Flag className="w-3 h-3" />
                                        <span>High Priority</span>
                                    </div>
                                )}

                                {/* Due Date */}
                                {todo.dueDate && (
                                    <div className={`
                            flex items-center gap-1.5 text-xs font-semibold transition-colors duration-300
                            ${todo.completed ? 'text-slate-400' :
                                            isOverdue ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md' :
                                                isDueToday ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md' : 'text-slate-500'}
                        `}>
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        <span>{formatFullDateTime(todo.dueDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Actions Menu (Visible sm:hidden) */}
                        {!isSelectionMode && (
                            <div className="sm:hidden ml-2 relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMobileMenu(true);
                                    }}
                                    className="p-2 text-slate-300 active:text-indigo-600 rounded-full active:bg-indigo-50 transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {/* Mobile Dropdown Modal (Portal) */}
                                {showMobileMenu && createPortal(
                                    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                                        <div className="absolute inset-0" onClick={(e) => { e.stopPropagation(); setShowMobileMenu(false); }}></div>

                                        <div
                                            className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 border-t sm:border border-slate-100"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex justify-center pt-3 pb-2 sm:hidden">
                                                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                                            </div>

                                            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
                                                <h3 className="font-bold text-slate-800 text-lg">Task Options</h3>
                                                <button
                                                    onClick={() => setShowMobileMenu(false)}
                                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="p-2 space-y-1">
                                                {!todo.completed ? (
                                                    <button
                                                        onClick={(e) => {
                                                            handleEditClick(e);
                                                            setShowMobileMenu(false);
                                                        }}
                                                        className="w-full flex items-center gap-4 px-4 py-4 text-left text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                                    >
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                            <Edit2 className="w-5 h-5" />
                                                        </div>
                                                        Edit Task
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowMobileMenu(false);
                                                            onToggle(todo.id);
                                                        }}
                                                        className="w-full flex items-center gap-4 px-4 py-4 text-left text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                                                    >
                                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                            <Undo2 className="w-5 h-5" />
                                                        </div>
                                                        Mark Incomplete
                                                    </button>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        handleDelete(e);
                                                        setShowMobileMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-4 px-4 py-4 text-left text-base font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                >
                                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                                        <Trash2 className="w-5 h-5" />
                                                    </div>
                                                    Delete Task
                                                </button>
                                            </div>
                                            <div className="h-6 sm:h-2"></div>
                                        </div>
                                    </div>,
                                    document.body
                                )}
                            </div>
                        )}

                        {/* Desktop Hover Actions (Hidden on Mobile) */}
                        {!isSelectionMode && (
                            <div className={`hidden sm:flex items-center gap-1 transition-all duration-200 ml-3 translate-x-2 ${todo.completed ? 'opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100 group-hover:translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}>
                                {!todo.completed && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Undo Button for completed items */}
                                {todo.completed && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggle(todo.id);
                                        }}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Mark as Incomplete"
                                    >
                                        <Undo2 className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TodoItem;
