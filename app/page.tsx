import { PrismaClient } from '@prisma/client';
import { addTransaction, deleteExpense, setBudget, addSubscription, deleteSubscription, addCategory, deleteCategory, generateDemoData } from './actions';
import { Trash2 } from 'lucide-react';
import ExpenseChart from '@/components/ExpenseChart';
import HistoryChart from '@/components/HistoryChart';
import SettingsModal from '@/components/SettingsModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import TransactionForm from '@/components/TransactionForm';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const prisma = new PrismaClient();

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();

  let transactions: any[] = [];
  let subscriptions: any[] = [];
  let categories: any[] = [];
  let budgetLimit = 0;

  if (userId) {
    transactions = await prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    subscriptions = await prisma.subscription.findMany({ where: { userId } });
    categories = await prisma.category.findMany({ where: { userId } });
    const budgetData = await prisma.budget.findFirst({ where: { userId } });
    budgetLimit = budgetData?.amount || 0;
  }

  // --- Calculations ---
  const incomeItems = transactions.filter(t => t.type === 'INCOME');
  const expenseItems = transactions.filter(t => t.type === 'EXPENSE' || !t.type);
  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Chart Data
  const chartDataMap = new Map<string, number>();
  expenseItems.forEach((item) => {
    const current = chartDataMap.get(item.category) || 0;
    chartDataMap.set(item.category, current + item.amount);
  });
  const pieData = Array.from(chartDataMap, ([category, amount]) => ({ category, amount }));

  const historyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      historyMap.set(label, 0);
  }
  expenseItems.forEach((item) => {
      const label = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (historyMap.has(label)) historyMap.set(label, (historyMap.get(label) || 0) + item.amount);
  });
  const barData = Array.from(historyMap, ([date, amount]) => ({ date, amount }));

  return (
    // DARK MODE: Main background changes to slate-950
    <main className="min-h-screen bg-[#F2F2F7] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      <SignedOut>
         <div className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center space-y-6 p-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100 dark:border-slate-800">
                <h1 className="text-4xl font-black tracking-tight dark:text-white">PesoWise</h1>
                <p className="text-gray-500 dark:text-gray-400">Sign in to manage your budget.</p>
                <SignInButton mode="modal">
                   <button className="bg-slate-900 dark:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform">
                      Sign In
                   </button>
                </SignInButton>
            </div>
         </div>
      </SignedOut>

      <SignedIn>
        <div className="w-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-4">
                 <div className="scale-110 border-2 border-white dark:border-slate-700 rounded-full"><UserButton afterSignOutUrl="/" /></div>
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                      Hi, {user?.firstName || 'Friend'}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Welcome to your financial command center.</p>
                 </div>
              </div>
            </div>

            {/* TOP ROW: BALANCE & SUBSCRIPTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* BALANCE CARD (Dark mode: Keep dark, but adjust borders/shadows) */}
               <div className="lg:col-span-2 bg-slate-900 dark:bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-900/10 dark:shadow-black/50 relative overflow-hidden flex flex-col justify-center min-h-[280px] border border-transparent dark:border-slate-800">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                      <div className="space-y-2">
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Total Net Balance
                          </p>
                          <h2 className="text-5xl md:text-7xl font-black tracking-tight">₱{totalBalance.toLocaleString()}</h2>
                          <p className="text-sm text-gray-500 font-medium pt-2">
                            {totalBalance > 0 ? "You are saving money! 🎉" : "Time to tighten the budget. 😬"}
                          </p>
                      </div>

                      <div className="flex items-center gap-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <div className="text-right">
                              <div className="text-xs text-emerald-400 font-bold uppercase mb-1 flex items-center justify-end gap-1">
                                Income <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              </div>
                              <div className="text-2xl font-bold">₱{totalIncome.toLocaleString()}</div>
                          </div>
                          <div className="w-px h-12 bg-gray-700/50"></div>
                          <div className="text-left">
                              <div className="text-xs text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-400" /> Expenses
                              </div>
                              <div className="text-2xl font-bold">₱{totalExpenses.toLocaleString()}</div>
                          </div>
                      </div>
                  </div>
                  <div className="absolute -right-10 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
               </div>

               {/* SUBSCRIPTIONS */}
               <div className="lg:col-span-1 h-full">
                  <SubscriptionCard 
                    subscriptions={subscriptions} 
                    addSubAction={addSubscription} 
                    deleteSubAction={deleteSubscription} 
                  />
               </div>
            </div>

            {/* MIDDLE ROW: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2">
                  <HistoryChart data={barData} />
               </div>
               <div className="lg:col-span-1">
                  <ExpenseChart data={pieData} />
               </div>
            </div>

            {/* BOTTOM ROW: ACTIONS & LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                <div className="lg:col-span-1 sticky top-6">
                    <TransactionForm categories={categories} addAction={addTransaction} />
                </div>

                {/* ACTIVITY LIST (Dark mode updated) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {transactions.length} Transactions
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                        {transactions.length === 0 && (
                          <div className="text-center py-10 text-gray-400">No transactions yet.</div>
                        )}
                        {transactions.map((t) => (
                            <div key={t.id} className="group bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-100 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-gray-100 dark:border-slate-600'}`}>
                                        {t.type === 'INCOME' ? '💰' : t.category === 'Food' ? '🍔' : t.category === 'Transport' ? '🚕' : '💸'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-base">{t.description}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                           {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {t.type === 'INCOME' ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">Income</span> : t.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <span className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                       {t.type === 'INCOME' ? '+' : '-'}₱{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <form action={deleteExpense.bind(null, t.id)}>
                                        <button className="text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          </div>
        </div>
      </SignedIn>
    </main>
  );
}