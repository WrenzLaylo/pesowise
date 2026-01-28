'use client';
import { useState } from 'react';
import { Plus, ArrowDown, ArrowUp } from 'lucide-react';

type Props = {
  categories: { id: number; name: string; icon: string }[];
  addAction: (formData: FormData) => void;
};

export default function TransactionForm({ categories, addAction }: Props) {
  const [type, setType] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'

  return (
    <div className="bg-white rounded-[2rem] p-1 shadow-sm border border-gray-200/60">
      
      {/* TOGGLE SWITCH */}
      <div className="flex p-2 gap-2">
        <button 
          onClick={() => setType('EXPENSE')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'EXPENSE' ? 'bg-slate-900 text-white shadow-lg' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}
        >
          <ArrowUp className="w-4 h-4" /> Expense
        </button>
        <button 
          onClick={() => setType('INCOME')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-transparent text-gray-400 hover:bg-gray-50'}`}
        >
          <ArrowDown className="w-4 h-4" /> Income
        </button>
      </div>

      <form action={addAction} className="space-y-3 px-6 pb-6 pt-2">
        <input type="hidden" name="type" value={type} />
        
        <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                    <input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-bold rounded-2xl py-4 pl-8 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg" />
                </div>
            </div>
            <div className="col-span-2">
                {type === 'EXPENSE' ? (
                   <select name="category" className="w-full h-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-semibold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                      <option value="Food">🍔 Food</option>
                      <option value="Transport">🚕 Transport</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Bills">🧾 Bills</option>
                      <option value="Entertainment">🎬 Fun</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                      ))}
                   </select>
                ) : (
                   <select name="category" className="w-full h-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-semibold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                      <option value="Salary">💰 Salary</option>
                      <option value="Freelance">💻 Freelance</option>
                      <option value="Gift">🎁 Gift</option>
                      <option value="Investments">📈 Investments</option>
                   </select>
                )}
            </div>
        </div>
        <input name="description" type="text" placeholder={type === 'EXPENSE' ? "What did you buy?" : "Where is this money from?"} required className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-medium rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
        
        <button type="submit" className={`w-full font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white ${type === 'EXPENSE' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}>
          <Plus className="w-5 h-5" /> {type === 'EXPENSE' ? 'Add Expense' : 'Add Income'}
        </button>
      </form>
    </div>
  );
}