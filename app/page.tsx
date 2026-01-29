import { PrismaClient } from '@prisma/client';
import { addTransaction, deleteExpense, addSubscription, deleteSubscription, addCategory, deleteCategory, generateDemoData } from './actions';
import { Trash2, TrendingUp, TrendingDown, Wallet, Target, ArrowRight, Calendar, PiggyBank } from 'lucide-react'; 
import SettingsModal from '@/components/SettingsModal';
import SubscriptionCard from '@/components/SubscriptionCard';
import TransactionForm from '@/components/TransactionForm';
import SearchFilter from '@/components/SearchFilter';
import ChartSection from '@/components/ChartSection'; // Import the new component
import { auth, currentUser } from '@clerk/nextjs/server';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
        description: { contains: query, mode: 'insensitive' }
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

  return (
    <main className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 selection:bg-emerald-100">
      
      <SignedOut>
         <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-slate-950 text-white selection:bg-emerald-500/30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 w-full max-w-md p-8 mx-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mb-4 shadow-lg shadow-emerald-500/20">
                            <Wallet className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                            PesoWise
                        </h1>
                        <p className="text-slate-400 text-lg font-medium">Master your money.</p>
                    </div>
                    <SignInButton mode="modal">
                       <button className="group relative w-full bg-white text-slate-950 font-bold py-4 px-8 rounded-2xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-xl shadow-white/5">
                          <span>Get Started</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </SignInButton>
                </div>
            </div>
         </div>
      </SignedOut>

      <SignedIn>
        <div className="w-full p-3 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 pb-2">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                 </div>
                 <span className="text-2xl font-black tracking-tight text-slate-900">
                    PesoWise
                 </span>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 bg-white md:bg-transparent p-2 md:p-0 rounded-2xl md:rounded-none border md:border-none border-gray-100 shadow-sm md:shadow-none">
                 <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                       <p className="text-sm font-bold text-slate-900 leading-none">{user?.firstName || 'Friend'}</p>
                       <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-1">Pro Member</p>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                 </div>
                 <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
                 <SettingsModal 
                    categories={categories} 
                    addCategoryAction={addCategory} 
                    deleteCategoryAction={deleteCategory} 
                    generateDemoDataAction={generateDemoData}
                 />
              </div>
            </div>

            {/* ROW 1: NET BALANCE (Full Width) */}
            <div className="w-full">
               <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden border border-transparent">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                      <div className="space-y-2">
                          <p className="text-gray-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Total Net Balance
                          </p>
                          <div className="flex items-baseline gap-4 flex-wrap">
                             <h2 className="text-5xl md:text-7xl font-black tracking-tight">₱{totalBalance.toLocaleString()}</h2>
                             <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${totalBalance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {totalBalance >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                                {totalBalance >= 0 ? '+ Saving' : '- Deficit'}
                             </div>
                          </div>
                      </div>

                      {/* Stats Grid inside Header */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Income</div>
                              <div className="text-lg font-bold">₱{totalIncome.toLocaleString()}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Expenses</div>
                              <div className="text-lg font-bold">₱{totalExpenses.toLocaleString()}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Daily Avg</div>
                              <div className="text-lg font-bold">₱{Math.round(dailyAverage).toLocaleString()}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Saved</div>
                              <div className="text-lg font-bold">₱{projectedSavings > 0 ? projectedSavings.toLocaleString() : '0'}</div>
                          </div>
                      </div>
                  </div>
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
                  <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
               </div>
            </div>

            {/* ROW 2: CHARTS & COMPACT STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
               
               {/* Toggleable Chart Section (Takes up 2/3) */}
               <div className="lg:col-span-2">
                  <ChartSection barData={barData} pieData={pieData} />
               </div>
               
               {/* Compact Budget & Savings (Takes up 1/3) */}
               <div className="lg:col-span-1 flex flex-col gap-4">
                  {/* Monthly Budget Compact */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Wallet className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-bold text-slate-900">Budget Used</span>
                            </div>
                            <span className="text-2xl font-black text-slate-900">{Math.round(spentPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${spentPercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-400">₱{totalExpenses.toLocaleString()} spent</p>
                  </div>

                  {/* Savings Rate Compact */}
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-[2rem] shadow-lg text-white flex-1 flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold opacity-90">Savings Rate</span>
                            </div>
                            <span className="text-2xl font-black">{Math.round(savingsRate)}%</span>
                        </div>
                        <div className="relative z-10 mt-2">
                            <p className="text-xs opacity-80 font-medium">
                                {savingsRate > 20 ? "Excellent work! 🚀" : "Keep pushing! 💪"}
                            </p>
                        </div>
                        {/* Blob */}
                        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  </div>
               </div>
            </div>

            {/* ROW 3: ACTIONS & LISTS (3 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
                
                {/* 1. Add Transaction */}
                <div className="lg:col-span-1 h-full">
                    <TransactionForm categories={categories} addAction={addTransaction} />
                </div>

                {/* 2. Subscriptions */}
                <div className="lg:col-span-1 h-full">
                     <SubscriptionCard subscriptions={subscriptions} addSubAction={addSubscription} deleteSubAction={deleteSubscription} />
                </div>

                {/* 3. Recent Activity */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-slate-900">Activity</h3>
                      <SearchFilter />
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                        {transactions.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                              <p className="text-gray-400 text-sm">No transactions yet.</p>
                          </div>
                        )}
                        {transactions.map((t) => (
                            <div key={t.id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lg ${t.type === 'INCOME' ? 'bg-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                                        {getCategoryIcon(t.category, t.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 text-sm truncate max-w-[100px]">{t.description}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">
                                           {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className={`block font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                       {t.type === 'INCOME' ? '+' : '-'}₱{t.amount.toLocaleString()}
                                    </span>
                                    <form action={deleteExpense.bind(null, t.id)} className="inline-block">
                                        <button className="text-[10px] text-red-400 hover:text-red-600 hover:underline">Delete</button>
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