'use client';

import { useState } from 'react';
import { Settings, X, Plus, Trash2, Tag } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type Props = {
  categories: Category[];
  addCategoryAction: (formData: FormData) => Promise<void>;
  deleteCategoryAction: (id: number) => Promise<void>;
  generateDemoDataAction: () => Promise<void>;
};

export default function SettingsModal({ categories, addCategoryAction, deleteCategoryAction, generateDemoDataAction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'data'>('categories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Emoji Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');

  async function handleAddCategory(formData: FormData) {
    setIsSubmitting(true);
    await addCategoryAction(formData);
    setIsSubmitting(false);
    setShowPicker(false);
    setSelectedEmoji('🏷️'); 
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowPicker(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="p-3 bg-white rounded-full text-slate-400 hover:text-slate-900 hover:bg-gray-100 transition-all shadow-sm border border-gray-100"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
       <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5" /> Settings
             </h2>
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
             </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 pt-2">
             <button 
               onClick={() => setActiveTab('categories')}
               className={`pb-3 text-sm font-bold border-b-2 transition-colors px-4 ${activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                Categories
             </button>
             <button 
               onClick={() => setActiveTab('data')}
               className={`pb-3 text-sm font-bold border-b-2 transition-colors px-4 ${activeTab === 'data' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
             >
                Data Management
             </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F9FAFB]">
             
             {activeTab === 'categories' && (
               <div className="space-y-6">
                  {/* Add New Category Form */}
                  <form action={handleAddCategory} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Add New Category</label>
                      
                      <div className="flex gap-3">
                          {/* Emoji Trigger */}
                          <div>
                             <button 
                               type="button"
                               onClick={() => setShowPicker(true)}
                               className="w-12 h-12 flex items-center justify-center text-2xl bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                             >
                                {selectedEmoji}
                             </button>
                             <input type="hidden" name="icon" value={selectedEmoji} />
                          </div>

                          <input 
                            name="name"
                            type="text" 
                            required
                            placeholder="Category Name (e.g. Travel)"
                            className="flex-1 bg-gray-50 border border-gray-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                          />
                          
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                      </div>
                  </form>

                  {/* List Existing Categories */}
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Categories</label>
                     {categories.length === 0 ? (
                        <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
                           <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                           <p className="text-sm text-gray-400">No custom categories yet.</p>
                        </div>
                     ) : (
                        categories.map(cat => (
                           <div key={cat.id} className="group flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                                    {cat.icon || '🏷️'}
                                 </div>
                                 <span className="font-medium text-slate-700">{cat.name}</span>
                              </div>
                              <form action={deleteCategoryAction.bind(null, cat.id)}>
                                 <button className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </form>
                           </div>
                        ))
                     )}
                  </div>
               </div>
             )}

             {activeTab === 'data' && (
                <div className="space-y-6">
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-2">Demo Mode</h3>
                        <p className="text-sm text-orange-600 mb-4">
                           Don't want to type? Generate random data to see how the charts look.
                        </p>
                        <form action={generateDemoDataAction}>
                           <button className="w-full bg-white text-orange-600 border border-orange-200 font-bold py-3 px-4 rounded-xl hover:bg-orange-100 transition-colors shadow-sm">
                              Generate Demo Data
                           </button>
                        </form>
                    </div>
                </div>
             )}
          </div>
          
          {/* 🛠️ FIX: Emoji Picker is now a fixed overlay (Pop-up center screen) */}
          {showPicker && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
                <div className="relative bg-white rounded-2xl shadow-2xl">
                   <button 
                      onClick={() => setShowPicker(false)}
                      className="absolute -top-3 -right-3 bg-slate-900 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                   >
                      <X className="w-4 h-4" />
                   </button>
                   <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      width={320} 
                      height={400} 
                      searchDisabled={false}
                      skinTonesDisabled
                   />
                </div>
                {/* Click backdrop to close */}
                <div className="absolute inset-0 -z-10" onClick={() => setShowPicker(false)}></div>
             </div>
          )}

       </div>
    </div>
  );
}