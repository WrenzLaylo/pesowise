'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

type SettingsProps = {
  categories: { id: number; name: string; icon: string }[];
  addCategoryAction: (formData: FormData) => void;
  deleteCategoryAction: (id: number) => void;
};

export default function SettingsModal({ categories, addCategoryAction, deleteCategoryAction }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-slate-900 transition-colors"
      >
        <span className="sr-only">Settings</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-lg">Settings</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Section: Custom Categories */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Custom Categories</h3>
            
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => deleteCategoryAction(cat.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-gray-400 text-sm italic">No custom categories yet.</p>}
            </div>

            {/* Add New Category Form */}
            <form action={(formData) => { addCategoryAction(formData); }} className="flex gap-2">
              <input 
                name="icon" 
                placeholder="🍔" 
                className="w-12 text-center bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" 
                maxLength={2}
                required
              />
              <input 
                name="name" 
                placeholder="Category name..." 
                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20" 
                required
              />
              <button type="submit" className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>

          <hr />

          {/* Section: Account Info */}
          <div>
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
             <p className="text-sm text-gray-600">
               Manage your subscription and profile details directly via your provider.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}