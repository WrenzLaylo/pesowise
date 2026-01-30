'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

type ChartProps = {
  data: {
    date: string;
    amount: number;
  }[];
};

export default function HistoryChart({ data }: ChartProps) {
  // Calculate insights
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const average = data.length > 0 ? total / data.length : 0;
  const maxDay = data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0;
  
  // Determine color based on amount relative to average
  const getBarColor = (amount: number) => {
    if (amount === 0) return '#E5E7EB'; // Gray for no spending
    if (amount > average * 1.5) return '#EF4444'; // Red for high spending
    if (amount > average) return '#F59E0B'; // Orange for above average
    return '#3B82F6'; // Blue for normal/low spending
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentOfMax = maxDay > 0 ? ((data.value / maxDay) * 100).toFixed(0) : 0;
      const isAboveAvg = data.value > average;
      
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-600">
          <p className="text-xs text-gray-400 dark:text-gray-300 font-medium mb-1">{data.payload.date}</p>
          <p className="text-2xl font-black mb-1">₱{data.value.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs">
            {isAboveAvg ? (
              <>
                <TrendingUp className="w-3 h-3 text-red-400" />
                <span className="text-red-400 font-medium">Above average</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Below average</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No activity yet</p>
          <p className="text-gray-400 text-xs mt-1">Your spending will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Chart */}
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                <stop offset="100%" stopColor="#F87171" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} 
              tickMargin={12}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} 
              tickFormatter={(value) => `₱${value}`}
              width={60}
            />
            
            <Tooltip 
              cursor={{ fill: '#F3F4F6', radius: 8, opacity: 0.5 }}
              content={<CustomTooltip />}
            />
            
            <Bar 
              dataKey="amount" 
              radius={[8, 8, 0, 0]} 
              barSize={36}
              animationDuration={800}
            >
              {data.map((entry, index) => {
                let fillColor = '#E5E7EB';
                
                if (entry.amount > 0) {
                  if (entry.amount > average * 1.5) {
                    fillColor = 'url(#redGradient)';
                  } else if (entry.amount > average) {
                    fillColor = 'url(#orangeGradient)';
                  } else {
                    fillColor = 'url(#blueGradient)';
                  }
                }
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={fillColor}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Line Indicator */}
      {average > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
            <div className="w-8 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-500 rounded-full"></div>
            <span className="font-bold text-gray-600 dark:text-gray-300">Average: ₱{Math.round(average).toLocaleString()}/day</span>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[10px] font-bold text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-blue-500 to-blue-400"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-orange-500 to-orange-400"></div>
          <span>Above Avg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-b from-red-500 to-red-400"></div>
          <span>High Spend</span>
        </div>
      </div>
    </div>
  );
}