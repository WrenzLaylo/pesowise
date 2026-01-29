'use client';
import { Trash2, CalendarClock, Plus, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type SubProps = {
  subscriptions: { id: number; name: string; amount: number; dueDay: number }[];
  addSubAction: (formData: FormData) => Promise<any>;
  deleteSubAction: (id: number) => Promise<any>;
};

export default function SubscriptionCard({ subscriptions, addSubAction, deleteSubAction }: SubProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const result = await addSubAction(formData);
      
      if (result.success) {
        toast.success(result.message);
        setIsAdding(false);
        e.currentTarget.reset();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const result = await deleteSubAction(id);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to delete subscription.');
    }
  };

  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let dueDate = new Date(currentYear, currentMonth, dueDay);
    
    if (currentDay > dueDay) {
      dueDate = new Date(currentYear, currentMonth + 1, dueDay);
    }
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getSubscriptionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('netflix')) return '🎬';
    if (lowerName.includes('spotify') || lowerName.includes('music')) return '🎵';
    if (lowerName.includes('gym') || lowerName.includes('fitness')) return '💪';
    if (lowerName.includes('cloud') || lowerName.includes('storage')) return '☁️';
    if (lowerName.includes('game') || lowerName.includes('xbox') || lowerName.includes('playstation')) return '🎮';
    if (lowerName.includes('prime') || lowerName.includes('amazon')) return '📦';
    if (lowerName.includes('youtube')) return '📺';
    if (lowerName.includes('phone') || lowerName.includes('mobile')) return '📱';
    if (lowerName.includes('internet') || lowerName.includes('wifi')) return '🌐';
    return '📋';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 h-[500px] flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-100 dark:border-slate-800">
        <div>
           <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
               <CalendarClock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
             </div>
             Subscriptions
           </h3>
           <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Monthly recurring costs</p>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-black text-slate-900 dark:text-white">₱{totalMonthly.toLocaleString()}</span>
           <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">per month</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 mb-5 scrollbar-custom">
         {subscriptions.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-3">
                  <CalendarClock className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No subscriptions yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add your recurring payments below</p>
           </div>
         )}
         
         <div className="space-y-2">
           {subscriptions.map((sub) => {
             const daysUntil = getDaysUntilDue(sub.dueDay);
             const isUrgent = daysUntil <= 3;
             
             return (
               <div 
                 key={sub.id} 
                 className="group flex items-center justify-between p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm"
               >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                     <div className="h-10 w-10 shrink-0 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-xl border border-gray-200 dark:border-slate-600 shadow-sm">
                       {getSubscriptionIcon(sub.name)}
                     </div>
                     <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{sub.name}</div>
                        <div className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${isUrgent ? 'text-red-500 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}>
                          <CalendarClock className="w-3 h-3" />
                          {daysUntil === 0 ? 'Due today!' : daysUntil === 1 ? 'Due tomorrow' : `Due in ${daysUntil} days`}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                     <span className="font-black text-slate-900 dark:text-white text-sm">₱{sub.amount.toLocaleString()}</span>
                     <button 
                       onClick={() => handleDelete(sub.id, sub.name)} 
                       className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                       aria-label="Delete subscription"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             );
           })}
         </div>
      </div>

      {/* Add Form */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 dark:from-purple-700 dark:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-900 text-white py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Subscription
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-800">
           <div className="grid grid-cols-2 gap-2">
              <input 
                name="name" 
                placeholder="Service name..." 
                required 
                autoFocus
                className="col-span-2 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <input 
                name="amount" 
                type="number" 
                step="0.01"
                placeholder="Amount (₱)" 
                required 
                className="bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <input 
                name="dueDay" 
                type="number" 
                min="1"
                max="31" 
                placeholder="Due day (1-31)" 
                required 
                className="bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:focus:bg-slate-700 transition-all border border-gray-200 dark:border-slate-700 focus:border-purple-500 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
           </div>
           <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 text-white py-3 rounded-xl text-sm font-bold hover:from-purple-700 hover:to-purple-800 dark:hover:from-purple-800 dark:hover:to-purple-900 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
           </div>
        </form>
      )}
    </div>
  );
}