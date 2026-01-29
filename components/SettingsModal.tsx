'use client';

import { useState } from 'react';
import { Settings, X, Plus, Trash2, Tag, Database, Sparkles, AlertTriangle } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import toast from 'react-hot-toast';

type Category = {
  id: number;
  name: string;
  icon?: string;
};

type Props = {
  categories: Category[];
  addCategoryAction: (formData: FormData) => Promise<any>;
  deleteCategoryAction: (id: number) => Promise<any>;
  generateDemoDataAction: () => Promise<any>;
};

export default function SettingsModal({ categories, addCategoryAction, deleteCategoryAction, generateDemoDataAction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'categories' | 'data'>('categories');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Emoji Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');

  async function handleAddCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await addCategoryAction(formData);
      
      if (result.success) {
        toast.success(result.message);
        setShowPicker(false);
        setSelectedEmoji('🏷️');
        e.currentTarget.reset();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(id: number, name: string) {
    try {
      const result = await deleteCategoryAction(id);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete category.');
    }
  }

  async function handleGenerateDemo() {
    setIsGenerating(true);
    
    try {
      const result = await generateDemoDataAction();
      
      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to generate demo data.');
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
        className="group relative p-3 bg-white dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-200 shadow-sm border border-gray-100 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-600"
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 pointer-events-auto border border-gray-100 dark:border-slate-800">
          
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-900 dark:bg-slate-700 rounded-xl shadow-lg">
                      <Settings className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">Settings</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Customize your experience</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
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
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                   <Tag className="w-4 h-4" />
                   Categories
                </button>
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    activeTab === 'data' 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                   <Database className="w-4 h-4" />
                   Data
                </button>
             </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto scrollbar-custom flex-1 bg-gray-50 dark:bg-slate-950">
             
             {activeTab === 'categories' && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
                  
                  {/* Add New Category Form */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm">
                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-3 border-b border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                           <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                           <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add New Category</h3>
                        </div>
                     </div>
                     
                     <form onSubmit={handleAddCategory} className="p-4 space-y-4">
                        <div className="flex gap-3">
                           {/* Emoji Button */}
                           <div className="relative">
                              <button 
                                type="button"
                                onClick={() => setShowPicker(true)}
                                className="w-14 h-14 flex items-center justify-center text-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
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
                             className="flex-1 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 block px-4 py-3 outline-none font-medium transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                           />
                           
                           <button 
                             type="submit" 
                             disabled={isSubmitting}
                             className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 text-white px-5 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm hover:shadow-md flex items-center gap-2"
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
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Categories</h3>
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                           {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                        </span>
                     </div>
                     
                     {categories.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                           <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                              <Tag className="w-8 h-8 text-gray-400" />
                           </div>
                           <p className="text-sm font-medium text-gray-400 mb-1">No custom categories yet</p>
                           <p className="text-xs text-gray-400 dark:text-gray-500">Create your first category above</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {categories.map(cat => (
                              <div key={cat.id} className="group relative bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200">
                                 <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                                       {cat.icon || '🏷️'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">{cat.name}</span>
                                       <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Custom</span>
                                    </div>
                                 </div>
                                 <button 
                                   onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                   className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                   aria-label="Delete category"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
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
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-800 overflow-hidden shadow-sm">
                        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-5 py-4 border-b border-orange-200 dark:border-orange-800">
                           <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                                 <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div>
                                 <h3 className="font-bold text-orange-900 dark:text-orange-100">Demo Mode</h3>
                                 <p className="text-xs text-orange-700 dark:text-orange-300 mt-0.5">Perfect for testing and previews</p>
                              </div>
                           </div>
                        </div>
                        
                        <div className="p-5 space-y-4">
                           <p className="text-sm text-orange-800 dark:text-orange-200 font-medium leading-relaxed">
                              Don't want to manually add transactions? Generate random sample data to see how your dashboard looks with real activity.
                           </p>
                           
                           <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3 text-xs text-orange-700 dark:text-orange-300 font-medium flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>This will add sample transactions and subscriptions to your account.</span>
                           </div>
                           
                           <button 
                             onClick={handleGenerateDemo}
                             disabled={isGenerating}
                             className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                       <div className="flex gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg h-fit">
                             <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                             <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Your Data is Safe</h4>
                             <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
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
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
               <button 
                  onClick={() => setShowPicker(false)}
                  className="absolute -top-3 -right-3 bg-slate-900 dark:bg-slate-700 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
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