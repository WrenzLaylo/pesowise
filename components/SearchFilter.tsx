'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useRef, useEffect } from 'react';

export default function SearchFilter() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`/?${params.toString()}`);
  }, 300);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={`relative flex items-center transition-all duration-300 ease-in-out ${isExpanded ? 'w-full sm:w-48' : 'w-8'}`}>
        {isExpanded ? (
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-3 pr-8 py-1 text-sm bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                    defaultValue={searchParams.get('q')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    onBlur={(e) => {
                        // Only collapse if empty
                        if (!e.target.value) setIsExpanded(false);
                    }}
                />
                <button 
                    onClick={() => {
                        handleSearch(''); 
                        if(inputRef.current) inputRef.current.value = '';
                        setIsExpanded(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        ) : (
            <button 
                onClick={() => setIsExpanded(true)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                aria-label="Search"
            >
                <Search className="w-4 h-4" />
            </button>
        )}
    </div>
  );
}