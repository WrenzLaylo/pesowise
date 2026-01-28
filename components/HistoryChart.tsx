'use client';

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ChartProps = {
  data: {
    date: string;
    amount: number;
  }[];
};

export default function HistoryChart({ data }: ChartProps) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <h3 className="font-bold text-lg mb-4 text-slate-900">Daily Activity</h3>
      
      <div className="h-48 w-full">
        {data.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 text-sm">No activity yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                tickMargin={10}
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6', radius: 8 }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Spent']}
              />
              <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > 1000 ? '#FF3B30' : '#007AFF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}