import { PrismaClient } from '@prisma/client';
import { addTransaction, deleteExpense, addSubscription, deleteSubscription, addCategory, deleteCategory, generateDemoData } from './actions';
import { Trash2, TrendingUp, TrendingDown, Wallet, Target, ArrowRight, Calendar, PiggyBank, Moon, Sun } from 'lucide-react'; 
import SettingsModal from '@/components/SettingsModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import TransactionForm from '@/components/TransactionForm';
import SearchFilter from '@/components/SearchFilter';
import ChartSection from '@/components/ChartSection';
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import DarkModeToggle from '@/components/DarkModeToggle';
import StatsCard from '@/components/StatsCard';
import QuickStats from '@/components/QuickStats';
import DeleteTransactionButton from '@/components/DeleteTransactionButton';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId } = await auth();
  const user = await currentUser();
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  let transactions: any[] = [];
  let subscriptions: any[] = [];
  let categories: any[] = [];
  
  if (userId) {
    transactions = await prisma.expense.findMany({ 
  where: { 
    userId,
    OR: query ? [
      { description: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } }
    ] : undefined
  }, 
  orderBy: { date: 'desc' } 
});
    subscriptions = await prisma.subscription.findMany({ where: { userId } });
    categories = await prisma.category.findMany({ where: { userId } });
  }

  const incomeItems = transactions.filter(t => t.type === 'INCOME');
  const expenseItems = transactions.filter(t => t.type === 'EXPENSE' || !t.type);
  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  const currentDate = new Date();
  const daysPassed = currentDate.getDate() || 1; 
  const dailyAverage = totalExpenses > 0 ? totalExpenses / daysPassed : 0;
  const projectedSavings = totalIncome - totalExpenses;

  // Calculate previous month for comparison
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const previousMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === (currentMonth - 1) && tDate.getFullYear() === currentYear;
  });
  const previousMonthExpenses = previousMonthTransactions
    .filter(t => t.type === 'EXPENSE' || !t.type)
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseChange = previousMonthExpenses > 0 
    ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
    : 0;

  const spentPercentage = totalIncome > 0 ? Math.min((totalExpenses / totalIncome) * 100, 100) : 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

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

  const getCategoryIcon = (categoryName: string, type: string) => {
    if (type === 'INCOME') return '💰';
    const customCat = categories.find((c: any) => c.name === categoryName);
    if (customCat?.icon) return customCat.icon;

    switch (categoryName) {
      case 'Food': return '🍔';
      case 'Transport': return '🚕';
      case 'Bills': return '💡';
      case 'Shopping': return '🛍️';
      case 'Entertainment': return '🎬';
      default: return '💸';
    }
  };

  // Calculate top spending category
  const topCategory = pieData.length > 0 
    ? pieData.reduce((max, item) => item.amount > max.amount ? item : max, pieData[0])
    : null;

  return (
    <main className="min-h-screen bg-[#F2F2F7] dark:bg-slate-950 font-sans text-slate-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300">
      
      <SignedOut>
         <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-950 text-white selection:bg-emerald-500/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mb-4 shadow-lg shadow-emerald-500/20 animate-bounce">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                            PesoWise
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">Master your money, one peso at a time.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <div className="text-center">
                        <div className="text-2xl font-black text-emerald-400">📊</div>
                        <p className="text-xs text-slate-400 mt-1">Analytics</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-blue-400">🎯</div>
                        <p className="text-xs text-slate-400 mt-1">Goals</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-black text-purple-400">📈</div>
                        <p className="text-xs text-slate-400 mt-1">Insights</p>
                      </div>
                    </div>
                    <SignInButton mode="modal">
                       <button className="group relative w-full bg-white text-slate-950 font-bold py-4 px-8 rounded-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                          <span>Get Started Free</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </SignInButton>
                </div>
            </div>
         </div>
      </SignedOut>

      <SignedIn>
        <div className="w-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 dark:shadow-emerald-500/20 transition-colors duration-300">
                    <Wallet className="w-6 h-6 text-emerald-400 dark:text-slate-900" />
                 </div>
                 <div>
                   <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      PesoWise
                   </span>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Welcome back, {user?.firstName || 'Friend'}! 👋</p>
                 </div>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4">
                 <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.firstName || 'Friend'}</p>
                       <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mt-0.5">Pro Member</p>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                 </div>
                 <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                 <DarkModeToggle />
                 <SettingsModal 
                    categories={categories} 
                    addCategoryAction={addCategory} 
                    deleteCategoryAction={deleteCategory} 
                    generateDemoDataAction={generateDemoData}
                 />
              </div>
            </div>

            {/* Quick Stats Banner */}
            <QuickStats 
              totalTransactions={transactions.length}
              topCategory={topCategory}
              expenseChange={expenseChange}
            />

            {/* ROW 1: NET BALANCE (Full Width) */}
            <div className="w-full">
               <div className="bg-slate-900 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/10 relative overflow-hidden transition-all duration-300">
                  <div className="relative z-10 space-y-6">
                      <div className="space-y-3">
                          <p className="text-gray-400 dark:text-gray-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Total Net Balance
                          </p>
                          <div className="flex items-baseline gap-3 flex-wrap">
                             <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-500">
                               ₱{totalBalance.toLocaleString()}
                             </h2>
                             <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-right-3 duration-500 delay-100 ${totalBalance >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                {totalBalance >= 0 ? <TrendingUp className="w-3.5 h-3.5"/> : <TrendingDown className="w-3.5 h-3.5"/>}
                                {totalBalance >= 0 ? 'Saving' : 'Deficit'}
                             </div>
                          </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                          <StatsCard 
                            label="Income" 
                            value={totalIncome} 
                            color="emerald"
                            delay={200}
                          />
                          <StatsCard 
                            label="Expenses" 
                            value={totalExpenses} 
                            color="red"
                            delay={300}
                          />
                          <StatsCard 
                            label="Daily Avg" 
                            value={Math.round(dailyAverage)} 
                            color="blue"
                            delay={400}
                          />
                          <StatsCard 
                            label="Saved" 
                            value={projectedSavings > 0 ? projectedSavings : 0} 
                            color="purple"
                            delay={500}
                          />
                      </div>
                  </div>
                  
                  {/* Background decorations */}
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                  <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
               </div>
            </div>

            {/* ROW 2: CHARTS & INSIGHTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Chart Section (2/3 width) */}
               <div className="lg:col-span-2">
                  <ChartSection barData={barData} pieData={pieData} />
               </div>
               
               {/* Insights Column (1/3 width) */}
               <div className="lg:col-span-1 flex flex-col gap-6">
                  
                  {/* Budget Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex-1 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl transition-colors duration-300">
                                    <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white">Budget Used</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{Math.round(spentPercentage)}%</span>
                        </div>
                        <div className="space-y-2">
                            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : spentPercentage > 70 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'}`} 
                                  style={{ width: `${spentPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">₱{totalExpenses.toLocaleString()} of ₱{totalIncome.toLocaleString()} spent</p>
                        </div>
                  </div>

                  {/* Savings Rate Card */}
                  <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700 rounded-3xl p-6 shadow-lg text-white flex-1 relative overflow-hidden transition-all duration-300">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Target className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold">Savings Rate</span>
                                </div>
                                <span className="text-3xl font-black">{Math.round(savingsRate)}%</span>
                            </div>
                            <p className="text-sm font-medium opacity-90">
                                {savingsRate > 30 ? "Outstanding! You're crushing it! 🚀" : savingsRate > 20 ? "Great work! Keep it up! 💪" : savingsRate > 10 ? "Good progress! 📈" : "Let's boost those savings! 💡"}
                            </p>
                        </div>
                        
                        {/* Decorative blobs */}
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  </div>
                  
               </div>
            </div>

            {/* ROW 3: ACTIONS & LISTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Transaction Form */}
                <div className="lg:col-span-1">
                    <TransactionForm categories={categories} addAction={addTransaction} />
                </div>

                {/* Subscriptions */}
                <div className="lg:col-span-1">
                     <SubscriptionCard subscriptions={subscriptions} addSubAction={addSubscription} deleteSubAction={deleteSubscription} />
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-[500px] transition-colors duration-300">
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-slate-800">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">Recent Activity</h3>
                      <SearchFilter />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-custom">
                        {transactions.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
                                  <Wallet className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-400 text-sm font-medium">No transactions yet</p>
                              <p className="text-gray-400 text-xs mt-1">Add your first transaction to get started</p>
                          </div>
                        )}
                        {transactions.map((t, index) => (
                            <div 
                              key={t.id} 
                              className="group flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-sm animate-in fade-in slide-in-from-bottom-2"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center text-xl font-medium shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800' : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700'}`}>
                                        {getCategoryIcon(t.category, t.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{t.description}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                                           <Calendar className="w-3 h-3" />
                                           {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <div className={`font-black text-base mb-1 ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                       {t.type === 'INCOME' ? '+' : '-'}₱{t.amount.toLocaleString()}
                                    </div>
                                    <DeleteTransactionButton transactionId={t.id} deleteAction={deleteExpense} />
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