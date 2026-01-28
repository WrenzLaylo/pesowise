'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// 1. UPDATED: Add Transaction (Handles both Income and Expense)
export async function addTransaction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const type = formData.get('type') as string; // "INCOME" or "EXPENSE"

  if (amount <= 0) throw new Error("Amount must be positive");

  await prisma.expense.create({
    data: {
      amount,
      description,
      category,
      type, 
      userId,
    },
  });

  revalidatePath('/');
}

// 2. NEW: Add Subscription
export async function addSubscription(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const dueDay = parseInt(formData.get('dueDay') as string);

  await prisma.subscription.create({
    data: { name, amount, dueDay, userId },
  });

  revalidatePath('/');
}

// 3. NEW: Delete Subscription
export async function deleteSubscription(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.subscription.deleteMany({ where: { id, userId } });
  revalidatePath('/');
}

export async function deleteExpense(id: number) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Only delete if the expense belongs to the current user
    await prisma.expense.deleteMany({
        where: {
            id,
            userId, // <--- Security check
        },
    });

    revalidatePath('/');
}

export async function setBudget(formData: FormData) {
    const { userId } = await auth();
    if (!userId) throw new Error('You must be logged in');

    const amount = parseFloat(formData.get('amount') as string);

    // Find budget specifically for THIS user
    const existing = await prisma.budget.findFirst({
        where: { userId }
    });

    if (existing) {
        await prisma.budget.update({
            where: { id: existing.id },
            data: { amount },
        });
    } else {
        await prisma.budget.create({
            data: { amount, userId },
        });
    }

    revalidatePath('/');
}

export async function addCategory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string || '🏷️'; // Default emoji

  await prisma.category.create({
    data: { name, icon, userId },
  });

  revalidatePath('/');
}

export async function deleteCategory(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await prisma.category.deleteMany({
    where: { id, userId },
  });

  revalidatePath('/');
}

// ... (keep all your existing imports and other functions)

// ADD THIS AT THE BOTTOM OF THE FILE
export async function generateDemoData() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // 1. Clear existing data
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.subscription.deleteMany({ where: { userId } });
  await prisma.category.deleteMany({ where: { userId } });
  await prisma.budget.deleteMany({ where: { userId } });

  // 2. Set Budget
  await prisma.budget.create({
    data: { amount: 25000, userId }
  });

  // 3. Create Categories
  const cats = ['Gym 🏋️', 'Date 🍷', 'Gaming 🎮', 'Coffee ☕'];
  for (const cat of cats) {
    await prisma.category.create({
      data: { name: cat.split(' ')[0], icon: cat.split(' ')[1], userId }
    });
  }

  // 4. Create Subscriptions
  await prisma.subscription.createMany({
    data: [
      { name: 'Netflix', amount: 549, dueDay: 15, userId },
      { name: 'Spotify', amount: 129, dueDay: 2, userId },
    ]
  });

  // 5. Generate Random Transactions
  const transactions = [];
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  
  // Add Salary
  transactions.push({
    amount: 30000,
    category: 'Salary',
    description: 'Monthly Pay',
    type: 'INCOME',
    date: new Date(),
    userId
  });

  // Add Expenses
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    transactions.push({
      amount: Math.floor(Math.random() * 1500) + 50,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: 'Random Expense',
      type: 'EXPENSE',
      date: date,
      userId
    });
  }

  await prisma.expense.createMany({ data: transactions });

  revalidatePath('/');
}