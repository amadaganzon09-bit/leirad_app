import React, { useState, useEffect } from 'react';
import { X, Award, Save, Loader2 } from 'lucide-react';
import { Goal } from '../../../types/budget';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<void>;
    onEdit?: (data: any) => Promise<void>; // Add onEdit prop
    editingGoal?: Goal | null; // Add editingGoal prop
    isLoading: boolean; // Add isLoading prop
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({
    isOpen, onClose, onAdd, onEdit, editingGoal, isLoading
}) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');

    // Update form fields when editing a goal
    useEffect(() => {
        if (editingGoal) {
            setName(editingGoal.name);
            setTarget(editingGoal.targetAmount.toString());
            setDeadline(editingGoal.deadline || '');
        } else {
            // Reset form when not editing
            setName('');
            setTarget('');
            setDeadline('');
        }
    }, [editingGoal, isOpen]);

    const handleSubmit = async () => {
        if (!name || !target) return;

        const data = {
            name,
            targetAmount: parseFloat(target),
            deadline: deadline || undefined
        };

        if (editingGoal && onEdit) {
            // Editing existing goal
            await onEdit({ ...data, id: editingGoal.id });
        } else {
            // Adding new goal
            await onAdd(data);
        }

        setName('');
        setTarget('');
        setDeadline('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <Award className="w-5 h-5 text-indigo-600" />
                        </div>
                        {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
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
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="e.g., New Laptop"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₱</span>
                            <input
                                type="number"
                                step="0.01"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-semibold"
                                placeholder="0.00"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deadline (Optional)</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{editingGoal ? 'Updating...' : 'Create Goal'}</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{editingGoal ? 'Update Goal' : 'Create Goal'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGoalModal;