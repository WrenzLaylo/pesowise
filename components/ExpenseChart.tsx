'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type ChartProps = {
    data: {
        category: string;
        amount: number;
    }[];
};

const COLORS = ['#007AFF', '#FF3B30', '#FF9500', '#5856D6', '#34C759']; // Blue, Red, Orange, Purple, Green

export default function ExpenseChart({ data }: ChartProps) {
    // If no data, show a gray circle
    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-[2rem] border border-gray-100">
                No data to display
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Spending Breakdown</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60} // Makes it a "Donut"
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`₱${value.toLocaleString()}`, 'Amount']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
                {data.map((entry, index) => (
                    <div key={entry.category} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {entry.category}
                    </div>
                ))}
            </div>
        </div>
    );
}