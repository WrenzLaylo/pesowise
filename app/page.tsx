import { PrismaClient } from '@prisma/client';
import { addTransaction, deleteExpense, addSubscription, deleteSubscription, addCategory, deleteCategory, generateDemoData } from './actions';
import { Trash2, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'; 
import ExpenseChart from '@/components/ExpenseChart';
import HistoryChart from '@/components/HistoryChart';
import SettingsModal from '@/components/SettingsModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import TransactionForm from '@/components/TransactionForm';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser();

  let transactions: any[] = [];
  let subscriptions: any[] = [];
  let categories: any[] = [];
  
  if (userId) {
    transactions = await prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    subscriptions = await prisma.subscription.findMany({ where: { userId } });
    categories = await prisma.category.findMany({ where: { userId } });
  }

  // --- Calculations ---
  const incomeItems = transactions.filter(t => t.type === 'INCOME');
  const expenseItems = transactions.filter(t => t.type === 'EXPENSE' || !t.type);
  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Budget Calculations
  const spentPercentage = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

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
    <main className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900">
      
      <SignedOut>
         <div className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center space-y-6 p-10 bg-white rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100">
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

      <SignedIn>
        <div className="w-full p-4 md:p-6 lg:p-8">
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
              
              <SettingsModal 
                 categories={categories} 
                 addCategoryAction={addCategory} 
                 deleteCategoryAction={deleteCategory} 
                 generateDemoDataAction={generateDemoData}
              />
            </div>

            {/* TOP ROW: BALANCE & SUBSCRIPTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* BALANCE CARD (Takes 2 columns) */}
               <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-900/10 relative overflow-hidden flex flex-col justify-center min-h-[300px] border border-transparent">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
                      <div className="space-y-2">
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Total Net Balance
                          </p>
                          <h2 className="text-5xl md:text-7xl font-black tracking-tight">₱{totalBalance.toLocaleString()}</h2>
                          <p className="text-sm text-gray-500 font-medium pt-2 flex items-center gap-2">
                            {totalBalance > 0 ? <TrendingUp className="w-4 h-4 text-emerald-500"/> : <TrendingDown className="w-4 h-4 text-red-500"/>}
                            {totalBalance > 0 ? "You are saving money! 🎉" : "Time to tighten the budget. 😬"}
                          </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                          <div className="text-left sm:text-right">
                              <div className="text-xs text-emerald-400 font-bold uppercase mb-1 flex items-center sm:justify-end gap-1">
                                Income <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              </div>
                              <div className="text-2xl font-bold">₱{totalIncome.toLocaleString()}</div>
                          </div>
                          <div className="hidden sm:block w-px h-12 bg-gray-700/50"></div>
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

               {/* SUBSCRIPTIONS (Takes 1 column) */}
               <div className="lg:col-span-1 h-full flex flex-col">
                  <SubscriptionCard 
                    subscriptions={subscriptions} 
                    addSubAction={addSubscription} 
                    deleteSubAction={deleteSubscription} 
                  />
               </div>
            </div>

            {/* MIDDLE ROW: CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 h-full">
                  <HistoryChart data={barData} />
               </div>
               <div className="lg:col-span-1 h-full">
                  <ExpenseChart data={pieData} />
               </div>
            </div>

            {/* BOTTOM ROW: ACTIONS & LIST (Modified for better fill) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* LEFT COLUMN: Sticky Tools */}
                {/* FIX APPLIED HERE: Added 'lg:' prefix to sticky and top-6 */}
                <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
                    {/* 1. Transaction Form */}
                    <TransactionForm categories={categories} addAction={addTransaction} />

                    {/* 2. Budget Overview Widget */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-purple-500" />
                                Monthly Budget
                            </h3>
                            <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                                {Math.round(spentPercentage)}% Used
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-red-500' : 'bg-purple-500'}`} 
                                style={{ width: `${spentPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            You have spent <b>₱{totalExpenses.toLocaleString()}</b> of your <b>₱{totalIncome.toLocaleString()}</b> income.
                        </p>
                    </div>

                    {/* 3. Financial Health Widget */}
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden">
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <Target className="w-5 h-5" />
                                <span className="text-sm font-bold uppercase tracking-wider">Savings Rate</span>
                            </div>
                            <div className="text-4xl font-black mb-1">
                                {Math.round(savingsRate)}%
                            </div>
                            <p className="text-sm opacity-90 font-medium">
                                {savingsRate > 20 ? "Excellent work! 🚀" : savingsRate > 0 ? "Good start, keep going!" : "Let's try to save more."}
                            </p>
                         </div>
                         <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Activity List */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full">
                        {transactions.length} Transactions
                      </span>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        {transactions.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl">💤</div>
                              <p className="text-gray-400 font-medium">No transactions yet.</p>
                              <p className="text-gray-300 text-sm">Add one on the left to get started.</p>
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
                    {/* Footer text to fill bottom space nicely */}
                    {transactions.length > 5 && (
                        <div className="pt-6 text-center border-t border-gray-50 mt-4">
                            <p className="text-xs text-gray-400">Showing recent transactions</p>
                        </div>
                    )}
                </div>
            </div>

          </div>
        </div>
      </SignedIn>
    </main>
  );
}