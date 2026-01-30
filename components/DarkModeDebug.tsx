'use client';

import { useEffect, useState } from 'react';

export default function DarkModeDebug() {
  const [isDarkClass, setIsDarkClass] = useState(false);
  const [theme, setTheme] = useState('');

  useEffect(() => {
    // Check initial state
    const checkDarkMode = () => {
      const hasDark = document.documentElement.classList.contains('dark');
      const storedTheme = localStorage.getItem('theme') || 'none';
      setIsDarkClass(hasDark);
      setTheme(storedTheme);
    };

    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const manualToggle = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2">
      {/* Status Card */}
      <div className="bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-xl p-4 shadow-xl max-w-xs">
        <h3 className="font-black text-slate-900 dark:text-white mb-3 text-sm">
          🐛 Dark Mode Debug
        </h3>
        
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">HTML has 'dark' class:</span>
            <span className={`font-bold ${isDarkClass ? 'text-green-600' : 'text-red-600'}`}>
              {isDarkClass ? '✅ YES' : '❌ NO'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">localStorage theme:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {theme}
            </span>
          </div>

          <div className="mt-3 p-2 bg-gray-100 dark:bg-slate-700 rounded">
            <div className="text-gray-900 dark:text-white font-bold">
              This text should change color →
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <button
            onClick={manualToggle}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
          >
            Manual Toggle (Test)
          </button>
          
          <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
            Click to manually test dark mode
          </div>
        </div>
      </div>

      {/* Color Test Boxes */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-600 p-3 rounded-lg">
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1">BG Test</div>
          <div className="text-xs font-black text-slate-900 dark:text-white">Should change</div>
        </div>
        
        <div className="bg-red-100 dark:bg-red-900 border-2 border-red-300 dark:border-red-700 p-3 rounded-lg">
          <div className="text-[10px] font-bold text-red-600 dark:text-red-300 mb-1">Color Test</div>
          <div className="text-xs font-black text-red-900 dark:text-red-100">Red variant</div>
        </div>
      </div>
    </div>
  );
}