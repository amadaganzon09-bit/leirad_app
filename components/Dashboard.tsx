
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sunset, Trophy, Zap, Quote } from 'lucide-react';
import { Todo } from '../types';
import { quotes } from '../data/quotes';

interface DashboardProps {
  user: string;
  todos: Todo[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, todos }) => {
  const [quote, setQuote] = useState('');
  const [animState, setAnimState] = useState('opacity-0 translate-y-2');

  useEffect(() => {
    // Logic to pick a consistent quote based on the current date
    const getQuoteOfTheDay = () => {
      const today = new Date();
      // Create a seed string based on the date (e.g., "Mon Oct 27 2025")
      const dateString = today.toDateString();

      // Simple hash function to convert string to a number
      let hash = 0;
      for (let i = 0; i < dateString.length; i++) {
        hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Use the hash to pick an index from the quotes array
      const index = Math.abs(hash) % quotes.length;
      return quotes[index];
    };

    setQuote(getQuoteOfTheDay());

    // Trigger enter animation shortly after mount
    const initialTimeout = setTimeout(() => {
      setAnimState('opacity-100 translate-y-0');
    }, 100);

    return () => {
      clearTimeout(initialTimeout);
    };
  }, []);

  // Time of day logic
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  let Icon = Sun;

  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
    Icon = Sun;
  } else if (hour >= 17) {
    greeting = 'Good Evening';
    Icon = hour >= 20 ? Moon : Sunset;
  }

  // Stats Logic
  // 1. Total Completed
  const completedCount = todos.filter(t => t.completed).length;

  // 2. Total Active
  const activeCount = todos.filter(t => !t.completed).length;

  // 3. Total Tasks
  const totalCount = completedCount + activeCount;

  // 4. Calculate Progress
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Overdue Count
  const overdueTasksCount = todos.filter(t =>
    !t.completed && t.dueDate && t.dueDate < Date.now()
  ).length;

  return (
    <div className="mb-8 animate-slide-in space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl shadow-xl shadow-indigo-200 text-white p-8">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-purple-500/30 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold mb-2 tracking-widest uppercase">
              <Icon className="w-4 h-4" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h2 className="text-4xl font-bold mb-3 tracking-tight text-white">{greeting}, <span className="text-indigo-200">{user}</span></h2>
            <p className="text-indigo-100 font-medium text-sm leading-relaxed max-w-lg opacity-90">
              {overdueTasksCount > 0
                ? `You have ${overdueTasksCount} overdue item${overdueTasksCount === 1 ? '' : 's'} requiring attention. Prioritize these first.`
                : progress === 100 && totalCount > 0
                  ? "All tasks completed. Incredible work!"
                  : "You're making progress. Ready to conquer the next task?"}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 min-w-[240px] w-full md:w-auto shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">Overall Progress</span>
              <span className="text-xl font-bold text-white">{progress}%</span>
            </div>

            {/* Bar */}
            <div className="w-full bg-black/20 rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/50 blur-[2px]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-indigo-50">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/10 rounded"><Zap className="w-3 h-3" /></div>
                <span>{activeCount} Left</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white/10 rounded"><Trophy className="w-3 h-3" /></div>
                <span>{completedCount} Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Quote Block */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4 min-h-[5.5rem] transition-shadow hover:shadow-md">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
          <Quote className="w-5 h-5" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Quote of the Day</h4>
          <div className="relative overflow-hidden">
            <p className={`text-slate-700 font-medium italic leading-relaxed transform transition-all duration-700 ease-out ${animState}`}>
              "{quote}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
