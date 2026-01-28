import { PrismaClient } from '@prisma/client';
import { addTransaction, deleteExpense, setBudget, addSubscription, deleteSubscription, addCategory, deleteCategory } from './actions';
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
    // 1. Fetch Transactions
    transactions = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    // 2. Fetch Subscriptions
    subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    // 3. Fetch Categories & Budget
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

  // History Bar Chart
  const historyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) { // Increased to 7 days
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
    // REMOVED: "flex flex-col items-center justify-center" (This was centering everything vertically)
    <main className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900">
      
      {/* LOGIN SCREEN (Centered only when logged out) */}
      <SignedOut>
         <div className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center space-y-6 p-10 bg-white rounded-[3rem] shadow-2xl max-w-md w-full">
                <h1 className="text-4xl font-black tracking-tight">PesoWise</h1>
                <p className="text-gray-500">Sign in to manage your budget.</p>
                <SignInButton mode="modal">
                   <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:scale-105 transition-transform">
                      Sign In
                   </button>
                </SignInButton>
            </div>
         </div>
      </SignedOut>

      {/* DASHBOARD (Full Width Layout) */}
      <SignedIn>
        <div className="w-full p-4 md:p-6 lg:p-8">
          
          {/* UPDATED: Container width increased to 7xl (approx 1280px) */}
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-4">
                 <div className="scale-110"><UserButton afterSignOutUrl="/" /></div>
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black">
                      Hi, {user?.firstName || 'Friend'}!
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Welcome to your financial command center.</p>
                 </div>
              </div>
              <SettingsModal categories={categories} addCategoryAction={addCategory} deleteCategoryAction={deleteCategory} />
            </div>

            {/* TOP ROW: GRID SYSTEM (3 Columns on Large Screens) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* 1. BALANCE CARD (Spans 2 columns) */}
               <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
                  <div className="relative z-10">
                     <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Total Net Balance</p>
                     <h2 className="text-5xl md:text-7xl font-black tracking-tight truncate">₱{totalBalance.toLocaleString()}</h2>
                     <div className="mt-8 flex gap-8 md:gap-16">
                        <div>
                           <div className="text-xs text-emerald-400 font-bold uppercase mb-1 flex items-center gap-1">
                             <div className="w-2 h-2 rounded-full bg-emerald-400" /> Income
                           </div>
                           <div className="text-xl md:text-2xl font-bold">₱{totalIncome.toLocaleString()}</div>
                        </div>
                        <div>
                           <div className="text-xs text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-400" /> Expenses
                           </div>
                           <div className="text-xl md:text-2xl font-bold">₱{totalExpenses.toLocaleString()}</div>
                        </div>
                     </div>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute top-10 right-10 opacity-20 hidden md:block">
                     <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                  </div>
               </div>

               {/* 2. SUBSCRIPTIONS (Spans 1 column) */}
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
               {/* Bar Chart (Timeline) - Spans 2 cols for better visibility */}
               <div className="lg:col-span-2">
                  <HistoryChart data={barData} />
               </div>
               
               {/* Pie Chart (Categories) - Spans 1 col */}
               <div className="lg:col-span-1">
                  <ExpenseChart data={pieData} />
               </div>
            </div>

            {/* BOTTOM ROW: ACTIONS & LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* TRANSACTION FORM (1 Column) */}
                <div className="lg:col-span-1 sticky top-6">
                    <TransactionForm categories={categories} addAction={addTransaction} />
                </div>

                {/* ACTIVITY LIST (2 Columns) */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[400px]">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
                        {transactions.length} Transactions
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                        {transactions.length === 0 && (
                          <div className="text-center py-10 text-gray-400">
                             No transactions yet. Add one to get started!
                          </div>
                        )}
                        {transactions.map((t) => (
                            <div key={t.id} className="group bg-gray-50/50 hover:bg-white rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-100 hover:shadow-md transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-700 border border-gray-100'}`}>
                                        {t.type === 'INCOME' ? '💰' : t.category === 'Food' ? '🍔' : t.category === 'Transport' ? '🚕' : '💸'}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-base">{t.description}</div>
                                        <div className="text-xs text-gray-500 font-medium mt-0.5">
                                           {new Date(t.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {t.type === 'INCOME' ? <span className="text-emerald-600 font-bold">Income</span> : t.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <span className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                       {t.type === 'INCOME' ? '+' : '-'}₱{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <form action={deleteExpense.bind(null, t.id)}>
                                        <button className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all">
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