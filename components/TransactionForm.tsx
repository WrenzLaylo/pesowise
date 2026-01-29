'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check, ArrowUpCircle, ArrowDownCircle, Sparkles, Calendar } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type Props = {
  categories: Category[];
  addAction: (formData: FormData) => Promise<void>;
};

export default function TransactionForm({ categories, addAction }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const defaultCategories: Category[] = [
    { id: -1, name: 'Food', icon: '🍔' },
    { id: -2, name: 'Transport', icon: '🚕' },
    { id: -3, name: 'Bills', icon: '💡' },
    { id: -4, name: 'Shopping', icon: '🛍️' },
    { id: -5, name: 'Entertainment', icon: '🎬' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await addAction(formData);
      formRef.current?.reset();
      setType('EXPENSE');
      setSelectedCategory('');
      setAmount('');
    } finally {
      setIsSubmitting(false);
    }
  }

  const getCategoryIcon = (catName: string) => {
     const cat = displayCategories.find(c => c.name === catName);
     return cat?.icon || '🏷️';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Add Transaction</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          Today
        </div>
      </div>

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5">
        
        <input type="hidden" name="type" value={type} />
        
        {/* Type Toggle */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
          <div className="p-1 bg-gray-50 rounded-xl flex relative border border-gray-200">
             <div 
               className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg shadow-sm transition-all duration-300 ease-out ${
                 type === 'INCOME' 
                   ? 'translate-x-[calc(100%+4px)] bg-gradient-to-br from-emerald-500 to-emerald-600' 
                   : 'translate-x-1 bg-gradient-to-br from-red-500 to-red-600'
               }`}
             ></div>
             <button 
               type="button" 
               onClick={() => setType('EXPENSE')}
               className={`relative z-10 w-1/2 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                 type === 'EXPENSE' 
                   ? 'text-white' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <ArrowDownCircle className="w-4 h-4" /> 
               <span>Expense</span>
             </button>
             <button 
               type="button" 
               onClick={() => setType('INCOME')}
               className={`relative z-10 w-1/2 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                 type === 'INCOME' 
                   ? 'text-white' 
                   : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               <ArrowUpCircle className="w-4 h-4" /> 
               <span>Income</span>
             </button>
          </div>
        </div>

            
            {/* Description */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                <input
                    name="description"
                    type="text"
                    required
                    placeholder="e.g., Lunch at Jollibee"
                    className="w-full bg-gray-50 border-2 border-gray-200 text-slate-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-4 py-3 outline-none transition-all focus:bg-white placeholder:text-gray-400"
                />
            </div>

            {/* Amount */}
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amount</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-lg">₱</span>
                    </div>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                        className="w-full bg-gray-50 border-2 border-gray-200 text-slate-900 text-xl font-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-4 pl-10 pr-4 outline-none transition-all focus:bg-white placeholder:text-gray-300"
                    />
                    {amount && (
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg ${
                        type === 'INCOME' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {type === 'INCOME' ? '+' : '-'}₱{parseFloat(amount).toLocaleString()}
                      </div>
                    )}
                </div>
            </div>

            {/* Category (Only for Expense) */}
            <div 
              className={`transition-all duration-300 ${
                type === 'EXPENSE' 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
              }`}
            >
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                <input type="hidden" name="category" value={type === 'INCOME' ? 'Income' : selectedCategory} />

                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`w-full bg-gray-50 border-2 text-left text-sm font-medium rounded-xl px-4 py-3.5 flex items-center justify-between outline-none transition-all ${
                          isCategoryOpen 
                            ? 'bg-white ring-2 ring-blue-500 border-blue-500' 
                            : 'border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        } ${!selectedCategory && 'text-gray-400'}`}
                    >
                        <span className="flex items-center gap-2.5">
                           {selectedCategory ? (
                             <>
                                <span className="text-xl">{getCategoryIcon(selectedCategory)}</span>
                                <span className="text-slate-900 font-bold">{selectedCategory}</span>
                             </>
                           ) : (
                             <>
                                <span className="text-xl">🏷️</span>
                                <span>Select a category</span>
                             </>
                           )}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    <div 
                      className={`absolute z-50 left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${
                        isCategoryOpen 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                      }`}
                    >
                        <div className="max-h-56 overflow-y-auto p-2 scrollbar-custom">
                            {displayCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat.name);
                                        setIsCategoryOpen(false);
                                    }}
                                    className={`w-full p-3 rounded-xl flex items-center justify-between transition-all duration-150 ${
                                      selectedCategory === cat.name 
                                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
                                        : 'hover:bg-gray-50 text-slate-700 border-2 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                                          selectedCategory === cat.name ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            {cat.icon || '🏷️'}
                                        </div>
                                        <span className="font-bold text-sm">{cat.name}</span>
                                    </div>
                                    {selectedCategory === cat.name && (
                                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <div className="p-3 border-t-2 border-gray-100 bg-yellow-50">
                                 <div className="flex items-center gap-2 text-xs text-yellow-700 font-medium">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Using defaults. Add custom categories in Settings!</span>
                                 </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !amount || (type === 'EXPENSE' && !selectedCategory)}
          className={`relative w-full text-white font-bold rounded-xl text-sm px-5 py-4 text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 ${
            type === 'INCOME'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/20'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-lg shadow-slate-900/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Add {type === 'INCOME' ? 'Income' : 'Expense'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}