import React, { useState } from 'react';
import { Award, Plus, Trash2, CheckCircle2, Target, Calendar, Edit2, Loader2 } from 'lucide-react';
import { Goal } from '../../types/budget';

interface GoalListProps {
    goals: Goal[];
    onContribute: (goalId: string, amount: number) => void;
    onDelete: (id: string) => void;
    onEdit: (goal: Goal) => void;
    onCreate: () => void;
    loadingGoalId?: string | null; // Add loading state for goal operations
}

const GoalList: React.FC<GoalListProps> = ({
    goals, onContribute, onDelete, onEdit, onCreate, loadingGoalId
}) => {
    const [contributionAmount, setContributionAmount] = useState<{ [key: string]: string }>({});

    const handleContribute = (goalId: string) => {
        const amount = parseFloat(contributionAmount[goalId]);
        if (amount > 0) {
            onContribute(goalId, amount);
            setContributionAmount(prev => ({ ...prev, [goalId]: '' }));
        }
    };

    if (goals.length === 0) {
        return (
            <div className="col-span-full text-center py-10 text-slate-400">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No savings goals yet</p>
                <button
                    onClick={onCreate}
                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                    Create your first goal
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => {
                const percentage = (goal.savedAmount / goal.targetAmount) * 100;
                const isCompleted = percentage >= 100;

                return (
                    <div key={goal.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-xl ${goal.color} text-white shadow-md`}>
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">{goal.name}</h3>
                                    {goal.deadline && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(goal);
                                    }}
                                    disabled={loadingGoalId === goal.id}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Edit goal"
                                >
                                    {loadingGoalId === goal.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Edit2 className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(goal.id);
                                    }}
                                    disabled={loadingGoalId === goal.id}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Delete goal"
                                >
                                    {loadingGoalId === goal.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold text-slate-700">Progress</span>
                                    <span className="font-bold text-indigo-600">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5 font-medium">Saved</p>
                                    <p className="text-xl font-bold text-slate-800">₱{goal.savedAmount.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-0.5 font-medium">Target</p>
                                    <p className="text-sm font-semibold text-slate-600">₱{goal.targetAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            {!isCompleted ? (
                                <div className="flex gap-2 pt-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₱</span>
                                        <input
                                            type="number"
                                            value={contributionAmount[goal.id] || ''}
                                            onChange={(e) => setContributionAmount(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                            placeholder="Amount"
                                            className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleContribute(goal.id)}
                                        disabled={!contributionAmount[goal.id]}
                                        className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-semibold text-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Goal Achieved!</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GoalList;