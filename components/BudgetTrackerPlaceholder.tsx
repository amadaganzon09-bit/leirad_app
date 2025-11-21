
import React from 'react';
import { Wallet, TrendingUp, PiggyBank, PieChart, ArrowRight, Lock } from 'lucide-react';

const BudgetTrackerPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Icon Area */}
      <div className="relative mb-8 group cursor-default">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 border border-indigo-50 transform group-hover:scale-105 transition-transform duration-300">
          <div className="relative">
             <Wallet className="w-20 h-20 text-indigo-600" />
             <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white p-2 rounded-full shadow-lg border-4 border-white">
                <Lock className="w-5 h-5" />
             </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -right-12 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 animate-bounce delay-700">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="absolute -bottom-4 -left-12 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 animate-bounce delay-100">
            <PieChart className="w-6 h-6 text-blue-500" />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-md px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">
            <PiggyBank className="w-3.5 h-3.5" />
            Coming Soon
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Smart <span className="text-indigo-600">Budgeting</span>
        </h2>
        
        <p className="text-slate-500 text-lg leading-relaxed mb-8">
          Take control of your finances with the same simplicity you use to manage your tasks. Track expenses, set goals, and visualize your savings.
        </p>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Expense Tracking</h4>
                <p className="text-xs text-slate-500 mt-1">Log daily spending effortlessly.</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <PieChart className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Visual Analytics</h4>
                <p className="text-xs text-slate-500 mt-1">See where your money goes.</p>
            </div>
        </div>

        <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
            <span>Notify Me When Ready</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};

export default BudgetTrackerPlaceholder;
