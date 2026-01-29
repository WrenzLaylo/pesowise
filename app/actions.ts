'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// ============================================================================
// TRANSACTION ACTIONS
// ============================================================================

/**
 * Add a new transaction (income or expense)
 */
export async function addTransaction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string; // "INCOME" or "EXPENSE"

    // Validation
    if (!amount || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    if (!description || description.trim().length === 0) {
      throw new Error("Description is required");
    }
    if (!category || category.trim().length === 0) {
      throw new Error("Category is required");
    }

    await prisma.expense.create({
      data: {
        amount,
        description: description.trim(),
        category: category.trim(),
        type,
        userId,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

/**
 * Delete a transaction
 */
export async function deleteExpense(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    // Only delete if the expense belongs to the current user (security check)
    await prisma.expense.deleteMany({
      where: {
        id,
        userId,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION ACTIONS
// ============================================================================

/**
 * Add a new subscription
 */
export async function addSubscription(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    const name = formData.get('name') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dueDay = parseInt(formData.get('dueDay') as string);

    // Validation
    if (!name || name.trim().length === 0) {
      throw new Error("Subscription name is required");
    }
    if (!amount || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    if (!dueDay || dueDay < 1 || dueDay > 31) {
      throw new Error("Due day must be between 1 and 31");
    }

    await prisma.subscription.create({
      data: {
        name: name.trim(),
        amount,
        dueDay,
        userId,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    await prisma.subscription.deleteMany({
      where: { id, userId },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
}

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

/**
 * Add a new custom category
 */
export async function addCategory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    const name = formData.get('name') as string;
    const icon = (formData.get('icon') as string) || '🏷️';

    // Validation
    if (!name || name.trim().length === 0) {
      throw new Error("Category name is required");
    }

    // Check if category already exists for this user
    const existing = await prisma.category.findFirst({
      where: {
        userId,
        name: name.trim(),
      },
    });

    if (existing) {
      throw new Error("Category already exists");
    }

    await prisma.category.create({
      data: {
        name: name.trim(),
        icon,
        userId,
      },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

/**
 * Delete a custom category
 */
export async function deleteCategory(id: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    await prisma.category.deleteMany({
      where: { id, userId },
    });

    revalidatePath('/');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ============================================================================
// BUDGET ACTIONS
// ============================================================================

/**
 * Set or update monthly budget
 */
export async function setBudget(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    const amount = parseFloat(formData.get('amount') as string);

    // Validation
    if (!amount || amount <= 0) {
      throw new Error("Budget amount must be a positive number");
    }

    // Find existing budget for this user
    const existing = await prisma.budget.findFirst({
      where: { userId },
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
  } catch (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
}

// ============================================================================
// DEMO DATA GENERATION
// ============================================================================

/**
 * Generate demo data for testing
 * WARNING: This will delete all existing data for the user
 */
export async function generateDemoData() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  try {
    // 1. Clear existing data
    await prisma.expense.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.category.deleteMany({ where: { userId } });
    await prisma.budget.deleteMany({ where: { userId } });

    // 2. Set Budget
    await prisma.budget.create({
      data: { amount: 25000, userId },
    });

    // 3. Create Custom Categories
    const customCategories = [
      { name: 'Gym', icon: '🏋️' },
      { name: 'Date', icon: '🍷' },
      { name: 'Gaming', icon: '🎮' },
      { name: 'Coffee', icon: '☕' },
    ];

    for (const cat of customCategories) {
      await prisma.category.create({
        data: { ...cat, userId },
      });
    }

    // 4. Create Subscriptions
    await prisma.subscription.createMany({
      data: [
        { name: 'Netflix', amount: 549, dueDay: 15, userId },
        { name: 'Spotify', amount: 129, dueDay: 2, userId },
        { name: 'YouTube Premium', amount: 159, dueDay: 10, userId },
        { name: 'Gym Membership', amount: 1500, dueDay: 1, userId },
      ],
    });

    // 5. Generate Random Transactions
    const transactions = [];
    const categories = [
      'Food', 'Transport', 'Shopping', 'Bills', 
      'Entertainment', 'Gym', 'Coffee', 'Gaming'
    ];
    const descriptions = {
      'Food': ['Jollibee', 'McDo', 'Grocery', 'Restaurant', 'Street Food'],
      'Transport': ['Grab', 'Bus Fare', 'Gas', 'Parking', 'Jeep Fare'],
      'Shopping': ['Clothes', 'Shoes', 'Gadgets', 'Books', 'Accessories'],
      'Bills': ['Electricity', 'Water', 'Internet', 'Phone', 'Insurance'],
      'Entertainment': ['Movies', 'Concert', 'Gaming', 'Netflix', 'Hobbies'],
      'Gym': ['Protein', 'Supplements', 'Equipment', 'Gym Fee'],
      'Coffee': ['Starbucks', 'Local Café', 'Coffee Beans', 'Milk Tea'],
      'Gaming': ['Steam', 'PlayStation', 'Game Purchase', 'In-game'],
    };

    // Add Monthly Salary (Income)
    transactions.push({
      amount: 35000,
      category: 'Salary',
      description: 'Monthly Salary',
      type: 'INCOME',
      date: new Date(new Date().setDate(1)), // First day of month
      userId,
    });

    // Add Freelance Income
    transactions.push({
      amount: 5000,
      category: 'Freelance',
      description: 'Side Project',
      type: 'INCOME',
      date: new Date(new Date().setDate(15)),
      userId,
    });

    // Generate 50 random expenses over the past 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 24));
      date.setMinutes(Math.floor(Math.random() * 60));

      const category = categories[Math.floor(Math.random() * categories.length)];
      const descList = descriptions[category as keyof typeof descriptions] || ['Expense'];
      const description = descList[Math.floor(Math.random() * descList.length)];
      
      // Vary amounts based on category
      let amount;
      if (category === 'Bills' || category === 'Gym') {
        amount = Math.floor(Math.random() * 2000) + 500; // 500-2500
      } else if (category === 'Shopping') {
        amount = Math.floor(Math.random() * 3000) + 500; // 500-3500
      } else {
        amount = Math.floor(Math.random() * 800) + 50; // 50-850
      }

      transactions.push({
        amount,
        category,
        description,
        type: 'EXPENSE',
        date,
        userId,
      });
    }

    // Sort by date and create
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    await prisma.expense.createMany({ data: transactions });

    revalidatePath('/');
  } catch (error) {
    console.error('Error generating demo data:', error);
    throw error;
  }
}