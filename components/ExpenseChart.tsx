'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

type ChartProps = {
    data: {
        category: string;
        amount: number;
    }[];
};

const COLORS = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#14B8A6', // Teal
];

export default function ExpenseChart({ data }: ChartProps) {
    // Calculate total and percentages
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const dataWithPercentage = data.map(item => ({
        ...item,
        percentage: ((item.amount / total) * 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount); // Sort by amount descending

    // If no data, show empty state
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <PieChart className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No spending data</p>
                    <p className="text-gray-400 text-xs mt-1">Add expenses to see breakdown</p>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 dark:border-slate-600 backdrop-blur-sm">
                    <p className="font-bold text-sm mb-1">{data.category}</p>
                    <p className="text-2xl font-black mb-1">₱{data.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-300">{data.percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 items-center">
            {/* Chart */}
            <div className="flex-1 w-full h-full min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="85%"
                            paddingAngle={3}
                            dataKey="amount"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    stroke="white"
                                    strokeWidth={2}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Total</p>
                        <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">₱{total.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Legend with Details */}
            <div className="w-full lg:w-48 space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-custom">
                {dataWithPercentage.map((entry, index) => (
                    <div 
                        key={entry.category} 
                        className="group bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl p-3 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-600"
                    >
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div 
                                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-700 shadow-sm" 
                                    style={{ backgroundColor: COLORS[data.findIndex(d => d.category === entry.category) % COLORS.length] }}
                                />
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{entry.category}</span>
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">{entry.percentage}%</span>
                        </div>
                        <div className="pl-5">
                            <p className="text-sm font-black text-slate-900 dark:text-white">₱{entry.amount.toLocaleString()}</p>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 pl-5">
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                        width: `${entry.percentage}%`,
                                        backgroundColor: COLORS[data.findIndex(d => d.category === entry.category) % COLORS.length]
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}