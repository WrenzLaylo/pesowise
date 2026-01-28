'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server'; // <--- Import Clerk Auth

const prisma = new PrismaClient();

export async function addExpense(formData: FormData) {
    const { userId } = await auth(); // Get logged-in user
    if (!userId) throw new Error('You must be logged in');

    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    // 🛑 SECURITY FIX: Prevent negative numbers
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }

    await prisma.expense.create({
        data: {
            amount,
            description,
            category,
            userId, // <--- Save the User ID
        },
    });

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