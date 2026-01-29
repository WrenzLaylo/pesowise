'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, Check, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

// FIX: Changed id from string to number
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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // FIX: Changed IDs to numbers (negative to distinguish from real DB IDs)
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
    await addAction(formData);
    formRef.current?.reset();
    setType('EXPENSE');
    setSelectedCategory('');
    setIsSubmitting(false);
  }

  const getCategoryIcon = (catName: string) => {
     const cat = displayCategories.find(c => c.name === catName);
     return cat?.icon || '🏷️';
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-blue-100 p-2 rounded-xl">
            <Plus className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">New Transaction</h3>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        
        <input type="hidden" name="type" value={type} />
        
        <div className="p-1 bg-gray-100 rounded-xl flex relative z-0">
           <div 
             className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${type === 'INCOME' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-1'}`}
           ></div>
           <button 
             type="button" 
             onClick={() => setType('EXPENSE')}
             className={`relative z-10 w-1/2 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${type === 'EXPENSE' ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <ArrowDownCircle className="w-4 h-4" /> Expense
           </button>
           <button 
             type="button" 
             onClick={() => setType('INCOME')}
             className={`relative z-10 w-1/2 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${type === 'INCOME' ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600'}`}
           >
             <ArrowUpCircle className="w-4 h-4" /> Income
           </button>
        </div>

        <div className="space-y-4 relative z-0">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Description</label>
                <input
                    name="description"
                    type="text"
                    required
                    placeholder="e.g. Jollibee"
                    className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3.5 outline-none transition-all focus:bg-white focus:shadow-md"
                />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Amount</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-400 font-bold">₱</span>
                    </div>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        onKeyDown={(e) => ["-", "e"].includes(e.key) && e.preventDefault()}
                        className="w-full bg-gray-50 border border-gray-200 text-slate-900 text-lg font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3.5 pl-8 outline-none transition-all focus:bg-white focus:shadow-md"
                    />
                </div>
            </div>
        </div>

        <div className={`relative z-20 transition-all duration-300 ${type === 'EXPENSE' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1 block">Category</label>
            <input type="hidden" name="category" value={type === 'INCOME' ? 'Income' : selectedCategory} />

            <div className="relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className={`w-full bg-gray-50 border border-gray-200 text-left text-sm rounded-xl p-3.5 flex items-center justify-between outline-none transition-all focus:ring-2 focus:ring-blue-500 ${isCategoryOpen ? 'bg-white ring-2 ring-blue-500 border-blue-500 shadow-md' : 'hover:bg-gray-100'}`}
                >
                    <span className={`font-medium ${selectedCategory ? 'text-slate-900' : 'text-gray-400'}`}>
                       {selectedCategory ? (
                         <span className="flex items-center gap-2">
                            <span>{getCategoryIcon(selectedCategory)}</span>
                            {selectedCategory}
                         </span>
                       ) : "Select Category"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>

                <div 
                  className={`absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top ${isCategoryOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                >
                    <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                        {displayCategories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.name);
                                    setIsCategoryOpen(false);
                                }}
                                className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${selectedCategory === cat.name ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-slate-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                                        {cat.icon || '🏷️'}
                                    </div>
                                    <span className="font-medium text-sm">{cat.name}</span>
                                </div>
                                {selectedCategory === cat.name && <Check className="w-4 h-4" />}
                            </div>
                        ))}
                    </div>
                    {categories.length === 0 && (
                        <div className="p-2 border-t border-gray-50 bg-yellow-50/50">
                             <p className="text-[10px] text-center text-yellow-600 font-medium">Using default categories. Add your own in Settings!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative z-10 w-full text-white bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-slate-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98]"
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
}