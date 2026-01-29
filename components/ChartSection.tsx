'use client';

import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import ExpenseChart from './ExpenseChart';
import HistoryChart from './HistoryChart';

export default function ChartSection({ barData, pieData }: { barData: any, pieData: any }) {
  const [view, setView] = useState<'activity' | 'breakdown'>('activity');

  // Calculate stats for activity view
  const totalSpent = barData.reduce((sum: number, item: any) => sum + item.amount, 0);
  const avgDaily = barData.length > 0 ? totalSpent / barData.length : 0;
  const maxDay = barData.reduce((max: any, item: any) => item.amount > max.amount ? item : max, barData[0] || { amount: 0 });
  const minDay = barData.reduce((min: any, item: any) => item.amount < min.amount ? item : min, barData[0] || { amount: 0 });

  // Calculate stats for breakdown view
  const topCategory = pieData.length > 0 
    ? pieData.reduce((max: any, item: any) => item.amount > max.amount ? item : max, pieData[0])
    : null;
  const categoryCount = pieData.length;
  const avgPerCategory = pieData.length > 0 
    ? pieData.reduce((sum: number, item: any) => sum + item.amount, 0) / pieData.length 
    : 0;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            Analytics
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {view === 'activity' ? 'Daily spending trends' : 'Category breakdown'}
          </p>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button 
            onClick={() => setView('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              view === 'activity' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>
          <button 
            onClick={() => setView('breakdown')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
              view === 'breakdown' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-gray-500 hover:text-slate-700 hover:bg-gray-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Breakdown</span>
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="flex-1 w-full min-h-[280px] mb-5">
        {view === 'activity' ? (
          <div key="activity" className="h-full w-full animate-in fade-in slide-in-from-left-5 duration-300">
             <HistoryChart data={barData} />
          </div>
        ) : (
          <div key="breakdown" className="h-full w-full animate-in fade-in slide-in-from-right-5 duration-300">
             <ExpenseChart data={pieData} />
          </div>
        )}
      </div>

      {/* Stats Summary Footer */}
      <div className="border-t border-gray-100 pt-5">
        {view === 'activity' ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
              </div>
              <div className="font-black text-slate-900">₱{totalSpent.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg/Day</span>
              </div>
              <div className="font-black text-slate-900">₱{Math.round(avgDaily).toLocaleString()}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Lowest</span>
              </div>
              <div className="font-black text-emerald-600">₱{minDay?.amount?.toLocaleString() || 0}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-red-600" />
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Highest</span>
              </div>
              <div className="font-black text-red-600">₱{maxDay?.amount?.toLocaleString() || 0}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <PieChart className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Categories</span>
              </div>
              <div className="font-black text-slate-900">{categoryCount}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Top Spend</span>
              </div>
              <div className="font-black text-purple-600 truncate text-sm">{topCategory?.category || 'N/A'}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg/Cat</span>
              </div>
              <div className="font-black text-slate-900">₱{Math.round(avgPerCategory).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}