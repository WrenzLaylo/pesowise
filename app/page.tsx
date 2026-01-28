import { PrismaClient } from '@prisma/client';
import { addExpense, deleteExpense, setBudget } from './actions';
import { Plus, Trash2 } from 'lucide-react';
import ExpenseChart from '@/components/ExpenseChart';
import HistoryChart from '@/components/HistoryChart'; // <--- NEW IMPORT
import { auth, currentUser } from '@clerk/nextjs/server'; // <--- NEW IMPORT
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import SettingsModal from '@/components/SettingsModal';
import { addCategory, deleteCategory } from './actions';

const prisma = new PrismaClient();

export default async function Home() {
  const { userId } = await auth();
  const user = await currentUser(); // <--- Fetch user profile data

  let expenses: any[] = [];
  let budgetLimit = 0;
  let categories: any[] = [];

  if (userId) {
    expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const budgetData = await prisma.budget.findFirst({
      where: { userId },
    });
    budgetLimit = budgetData?.amount || 0;

    categories = await prisma.category.findMany({
      where: { userId },
    });
  }

  // --- 1. Calculate Totals ---
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = budgetLimit - totalExpenses;
  const percentage = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;

  // --- 2. Pie Chart Data (Category) ---
  const chartDataMap = new Map<string, number>();
  expenses.forEach((item) => {
    const current = chartDataMap.get(item.category) || 0;
    chartDataMap.set(item.category, current + item.amount);
  });
  const pieData = Array.from(chartDataMap, ([category, amount]) => ({ category, amount }));

  // --- 3. NEW: Bar Chart Data (Last 5 Days) ---
  const historyMap = new Map<string, number>();

  // Initialize last 5 days with 0 to make the chart look nice even if empty
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g., "Jan 28"
    historyMap.set(label, 0);
  }

  // Fill in actual data
  expenses.forEach((item) => {
    const label = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (historyMap.has(label)) {
      historyMap.set(label, (historyMap.get(label) || 0) + item.amount);
    }
  });

  const barData = Array.from(historyMap, ([date, amount]) => ({ date, amount }));


  return (
    <main className="min-h-screen bg-[#F2F2F7] font-sans text-slate-900 flex flex-col items-center justify-center">

      {/* LOGIN SCREEN */}
      <SignedOut>
        {/* ... (Keep existing login screen code) ... */}
        <div className="text-center space-y-6 p-10 bg-white rounded-[3rem] shadow-2xl max-w-md mx-6">
          <h1 className="text-4xl font-black tracking-tight">PesoWise</h1>
          <p className="text-gray-500">Sign in to manage your budget.</p>
          <SignInButton mode="modal">
            <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl">Sign In</button>
          </SignInButton>
        </div>
      </SignedOut>

      {/* DASHBOARD */}
      <SignedIn>
        <div className="w-full min-h-screen p-6 md:p-12">
          <div className="max-w-xl mx-auto space-y-6">

            {/* NEW HEADER WITH PROFILE */}
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-4">
                {/* Clerk handles the Avatar via UserButton */}
                <div className="scale-125"><UserButton afterSignOutUrl="/" /></div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-black">
                    Hi, {user?.firstName || 'Friend'}!
                  </h1>
                  <p className="text-gray-500 text-sm font-medium">Here is your financial overview</p>
                </div>
                {/* Settings Button */}
                <SettingsModal
                  categories={categories}
                  addCategoryAction={addCategory}
                  deleteCategoryAction={deleteCategory}
                />
              </div>
            </div>

            {/* BUDGET CARD */}
            {/* ... (Paste your existing Budget Card code here) ... */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-white/50">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Total Spent</p>
                  <h2 className="text-5xl font-extrabold text-slate-900">₱{totalExpenses.toLocaleString()}</h2>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Goal</p>
                  <h3 className="text-xl font-bold text-gray-400">/ ₱{budgetLimit.toLocaleString()}</h3>
                </div>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${percentage > 100 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <form action={setBudget} className="mt-6 flex gap-2">
                <input type="number" name="amount" placeholder="Set budget..." min="0.00" required className="bg-gray-50 rounded-xl px-4 py-2 w-full text-sm font-bold outline-none" />
                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold">Set</button>
              </form>
            </div>

            {/* CHARTS GRID (NEW) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Category Chart */}
              <ExpenseChart data={pieData} />

              {/* 2. NEW History Chart */}
              <HistoryChart data={barData} />
            </div>

            {/* ADD EXPENSE FORM */}
            <div className="bg-white rounded-[2rem] p-1 shadow-sm border border-gray-200/60">
              <div className="p-6 pb-2"><h3 className="font-bold text-lg mb-4">New Transaction</h3></div>
              <form action={addExpense} className="space-y-3 px-6 pb-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₱</span>
                      {/* FIX: ADDED MIN ATTRIBUTE */}
                      <input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-bold rounded-2xl py-4 pl-8 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-lg" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <select name="category" className="w-full h-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-semibold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none">
                      {/* Default Static Options */}
                      <option value="Food">🍔 Food</option>
                      <option value="Transport">🚕 Transport</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Bills">🧾 Bills</option>
                      <option value="Entertainment">🎬 Fun</option>

                      {/* Dynamic User Categories */}
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <input name="description" type="text" placeholder="Description..." required className="w-full bg-gray-100/50 hover:bg-gray-100 focus:bg-white text-slate-900 font-medium rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                <button type="submit" className="w-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Add
                </button>
              </form>
            </div>

            {/* LIST */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold px-2">History</h3>
              {expenses.map((expense) => (
                <div key={expense.id} className="group bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg">
                      {expense.category === 'Food' ? '🍔' : expense.category === 'Transport' ? '🚕' : '💸'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{expense.description}</div>
                      <div className="text-xs text-gray-500 font-medium">{new Date(expense.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">-₱{expense.amount.toFixed(2)}</span>
                    <form action={deleteExpense.bind(null, expense.id)}>
                      <button className="text-gray-300 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}