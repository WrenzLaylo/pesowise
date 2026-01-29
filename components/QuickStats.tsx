'use client';

import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

type QuickStatsProps = {
  totalTransactions: number;
  topCategory: { category: string; amount: number } | null;
  expenseChange: number;
};

export default function QuickStats({ totalTransactions, topCategory, expenseChange }: QuickStatsProps) {
  const isIncreasing = expenseChange > 0;
  
  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-4 border border-blue-100 dark:border-slate-700 transition-colors duration-300 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        
        {/* Total Transactions */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Transactions</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{totalTransactions}</p>
          </div>
        </div>

        {/* Top Category */}
        {topCategory && (
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Top Category</p>
              <p className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[120px]">{topCategory.category}</p>
            </div>
          </div>
        )}

        {/* Expense Change */}
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isIncreasing ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">vs Last Month</p>
            <p className={`text-lg font-black ${isIncreasing ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isIncreasing ? '+' : ''}{Math.abs(expenseChange).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Insight Message */}
        <div className="flex-1 min-w-[200px] text-right">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {isIncreasing && expenseChange > 10 
              ? '💡 Spending increased. Review your budget!'
              : isIncreasing && expenseChange > 0
              ? '📊 Slight increase in spending this month.'
              : expenseChange < -10
              ? '🎉 Great job! You\'re spending less!'
              : '✅ Spending is stable. Keep it up!'}
          </p>
        </div>

      </div>
    </div>
  );
}