'use client';

import { Search, X, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useRef, useEffect } from 'react';

export default function SearchFilter() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`/?${params.toString()}`);
    setHasValue(!!term);
  }, 300);

  const clearSearch = () => {
    handleSearch(''); 
    if(inputRef.current) inputRef.current.value = '';
    setHasValue(false);
    setIsExpanded(false);
  };

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isExpanded]);

  // Initialize hasValue from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    setHasValue(!!query);
    if (query) {
      setIsExpanded(true);
    }
  }, [searchParams]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!hasValue) {
          setIsExpanded(false);
        }
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, hasValue]);

  return (
    <div 
      ref={containerRef}
      className={`relative flex items-center transition-all duration-300 ease-out ${isExpanded ? 'w-full sm:w-56' : 'w-auto'}`}
    >
        {isExpanded ? (
            <div className="relative w-full group animate-in slide-in-from-right-5 fade-in duration-300">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all placeholder:text-gray-400"
                    defaultValue={searchParams.get('q')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
                {hasValue && (
                    <button 
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg animate-in zoom-in duration-200"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        ) : (
            <button 
                onClick={() => setIsExpanded(true)}
                className="group relative p-2.5 bg-gray-100 hover:bg-slate-900 rounded-xl text-gray-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Search transactions"
            >
                <Search className="w-4 h-4 transition-transform group-hover:scale-110" />
                
                {/* Active indicator */}
                {hasValue && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>
        )}
    </div>
  );
}