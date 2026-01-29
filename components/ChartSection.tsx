'use client';

import { useState } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import HistoryChart from './HistoryChart';

export default function ChartSection({ barData, pieData }: { barData: any, pieData: any }) {
  const [view, setView] = useState<'activity' | 'breakdown'>('activity');

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-900">Analytics</h3>
        
        <div className="flex bg-gray-50 p-1 rounded-xl self-start sm:self-auto">
          <button 
            onClick={() => setView('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              view === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Activity</span>
          </button>
          <button 
            onClick={() => setView('breakdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              view === 'breakdown' ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-slate-700'
            }`}
          >
            <PieChart className="w-3 h-3" />
            <span>Breakdown</span>
          </button>
        </div>
      </div>

      {/* Chart Content - FIXED HEIGHT to prevent layout shift */}
      <div className="flex-1 w-full min-h-[300px] h-[300px]">
        {view === 'activity' ? (
          <div className="h-full w-full animate-in fade-in zoom-in duration-300">
             <HistoryChart data={barData} />
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
             <ExpenseChart data={pieData} />
          </div>
        )}
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-4 border-t border-gray-50 pt-4">
        {view === 'activity' ? 'Your spending over the last 7 days.' : 'Where your money went this month.'}
      </p>
    </div>
  );
}