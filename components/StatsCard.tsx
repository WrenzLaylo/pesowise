'use client';

import { useEffect, useState } from 'react';

type StatsCardProps = {
  label: string;
  value: number;
  color: 'emerald' | 'red' | 'blue' | 'purple';
  delay?: number;
};

export default function StatsCard({ label, value, color, delay = 0 }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animate the number counting up
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const colorClasses = {
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400'
  };

  return (
    <div 
      className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200 animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-[10px] text-gray-400 dark:text-gray-300 font-bold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className={`text-xl md:text-2xl font-black ${colorClasses[color]} transition-all duration-300`}>
        ₱{displayValue.toLocaleString()}
      </div>
    </div>
  );
}