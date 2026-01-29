'use client';

import { useState } from 'react';
import { Settings, X, Plus, Trash2, Tag, Database, Sparkles, AlertTriangle } from 'lucide-react';
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Emoji Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');

  async function handleAddCategory(formData: FormData) {
    setIsSubmitting(true);
    try {
      await addCategoryAction(formData);
      setShowPicker(false);
      setSelectedEmoji('🏷️'); 
      // Reset form
      const form = document.querySelector('form[action]') as HTMLFormElement;
      if (form) form.reset();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGenerateDemo() {
    setIsGenerating(true);
    try {
      await generateDemoDataAction();
      setIsOpen(false);
    } finally {
      setIsGenerating(false);
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setSelectedEmoji(emojiData.emoji);
    setShowPicker(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative p-3 bg-white hover:bg-slate-900 rounded-xl text-slate-600 hover:text-white transition-all duration-200 shadow-sm border border-gray-100 hover:border-slate-900"
        aria-label="Open settings"
      >
        <Settings className="w-5 h-5 transition-transform group-hover:rotate-45 duration-300" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-900 rounded-xl shadow-lg">
                      <Settings className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-slate-900">Settings</h2>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Customize your experience</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-slate-900"
                  aria-label="Close settings"
                >
                   <X className="w-5 h-5" />
                </button>
             </div>

             {/* Tabs */}
             <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setActiveTab('categories')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'categories' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-gray-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                   <Tag className="w-4 h-4" />
                   Categories
                </button>
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'data' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-gray-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                   <Database className="w-4 h-4" />
                   Data
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto scrollbar-custom flex-1 bg-gray-50">
             
             {activeTab === 'categories' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                  
                  {/* Add New Category Form */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                           <Plus className="w-4 h-4 text-blue-600" />
                           <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
                        </div>
                     </div>
                     
                     <form action={handleAddCategory} className="p-4 space-y-4">
                        <div className="flex gap-3">
                           {/* Emoji Button */}
                           <div className="relative">
                              <button 
                                type="button"
                                onClick={() => setShowPicker(true)}
                                className="w-14 h-14 flex items-center justify-center text-3xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all duration-200 group"
                                aria-label="Choose emoji"
                              >
                                 {selectedEmoji}
                              </button>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Plus className="w-3 h-3 text-white" />
                              </div>
                              <input type="hidden" name="icon" value={selectedEmoji} />
                           </div>

                           <input 
                             name="name"
                             type="text" 
                             required
                             placeholder="e.g., Travel, Groceries, Entertainment..."
                             className="flex-1 bg-gray-50 border-2 border-gray-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white block px-4 py-3 outline-none font-medium transition-all placeholder:text-gray-400"
                           />
                           
                           <button 
                             type="submit" 
                             disabled={isSubmitting}
                             className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm hover:shadow-md flex items-center gap-2"
                           >
                              {isSubmitting ? (
                                 <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Adding...</span>
                                 </>
                              ) : (
                                 <>
                                    <Plus className="w-5 h-5" />
                                    <span className="hidden sm:inline">Add</span>
                                 </>
                              )}
                           </button>
                        </div>
                     </form>
                  </div>

                  {/* List Categories */}
                  <div className="space-y-3">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Categories</h3>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                           {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                        </span>
                     </div>
                     
                     {categories.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                           <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Tag className="w-8 h-8 text-gray-400" />
                           </div>
                           <p className="text-sm font-medium text-gray-400 mb-1">No custom categories yet</p>
                           <p className="text-xs text-gray-400">Create your first category above</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {categories.map(cat => (
                              <div key={cat.id} className="group relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                                 <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl border border-gray-200 shadow-sm">
                                       {cat.icon || '🏷️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <span className="font-bold text-slate-900 text-sm block truncate">{cat.name}</span>
                                       <span className="text-xs text-gray-500 font-medium">Custom</span>
                                    </div>
                                 </div>
                                 <form action={deleteCategoryAction.bind(null, cat.id)} className="absolute top-3 right-3">
                                    <button 
                                      type="submit"
                                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                      aria-label="Delete category"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </form>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
             )}

             {activeTab === 'data' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-5 duration-300">
                    
                    {/* Demo Data Section */}
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border-2 border-orange-200 overflow-hidden shadow-sm">
                        <div className="bg-white/50 backdrop-blur-sm px-5 py-4 border-b border-orange-200">
                           <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-orange-100 rounded-xl">
                                 <Sparkles className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-orange-900">Demo Mode</h3>
                                 <p className="text-xs text-orange-700 mt-0.5">Perfect for testing and previews</p>
                              </div>
                           </div>
                        </div>
                        
                        <div className="p-5 space-y-4">
                           <p className="text-sm text-orange-800 font-medium leading-relaxed">
                              Don't want to manually add transactions? Generate random sample data to see how your dashboard looks with real activity.
                           </p>
                           
                           <div className="bg-orange-100 rounded-xl p-3 text-xs text-orange-700 font-medium flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>This will add sample transactions and subscriptions to your account.</span>
                           </div>
                           
                           <form action={handleGenerateDemo}>
                              <button 
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                 {isGenerating ? (
                                    <>
                                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                       Generating Demo Data...
                                    </>
                                 ) : (
                                    <>
                                       <Sparkles className="w-5 h-5" />
                                       Generate Demo Data
                                    </>
                                 )}
                              </button>
                           </form>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                       <div className="flex gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg h-fit">
                             <Database className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                             <h4 className="font-bold text-blue-900 text-sm mb-1">Your Data is Safe</h4>
                             <p className="text-xs text-blue-700 leading-relaxed">
                                All your financial data is securely stored and never shared. You have full control over your information.
                             </p>
                          </div>
                       </div>
                    </div>
                </div>
             )}
          </div>

        </div>
      </div>

      {/* Emoji Picker Overlay */}
      {showPicker && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative bg-white rounded-2xl shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
               <button 
                  onClick={() => setShowPicker(false)}
                  className="absolute -top-3 -right-3 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Close emoji picker"
               >
                  <X className="w-4 h-4" />
               </button>
               <EmojiPicker 
                  onEmojiClick={onEmojiClick} 
                  width={340} 
                  height={450} 
                  searchDisabled={false}
                  skinTonesDisabled
                  previewConfig={{ showPreview: false }}
               />
            </div>
            {/* Click backdrop to close */}
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setShowPicker(false)}
            />
         </div>
      )}
    </>
  );
}