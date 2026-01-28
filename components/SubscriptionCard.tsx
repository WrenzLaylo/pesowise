'use client';
import { Trash2, CalendarClock } from 'lucide-react';

type SubProps = {
  subscriptions: { id: number; name: string; amount: number; dueDay: number }[];
  addSubAction: (formData: FormData) => void;
  deleteSubAction: (id: number) => void;
};

export default function SubscriptionCard({ subscriptions, addSubAction, deleteSubAction }: SubProps) {
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
             <CalendarClock className="w-5 h-5 text-purple-500" /> Subscriptions
           </h3>
           <p className="text-sm text-gray-400 font-medium">Monthly recurring costs</p>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-black text-slate-900">₱{totalMonthly.toLocaleString()}</span>
           <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">/ Month</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 space-y-3 mb-6 overflow-y-auto max-h-48 pr-2">
         {subscriptions.length === 0 && <p className="text-sm text-gray-300 italic">No subscriptions yet.</p>}
         {subscriptions.map((sub) => (
           <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                 <div className="font-bold text-slate-800 text-sm">{sub.name}</div>
                 <div className="text-xs text-purple-500 font-bold">Due day: {sub.dueDay}</div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="font-bold text-slate-900">₱{sub.amount}</span>
                 <button onClick={() => deleteSubAction(sub.id)} className="text-gray-300 hover:text-red-500">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Add Form */}
      <form action={addSubAction} className="pt-4 border-t border-gray-100 grid grid-cols-4 gap-2">
         <input name="name" placeholder="Netflix..." required className="col-span-2 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
         <input name="amount" type="number" placeholder="₱" required className="col-span-1 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
         <input name="dueDay" type="number" max="31" placeholder="Day" required className="col-span-1 bg-gray-50 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
         <button type="submit" className="col-span-4 bg-purple-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors">Add Subscription</button>
      </form>
    </div>
  );
}