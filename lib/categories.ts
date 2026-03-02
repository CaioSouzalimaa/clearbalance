import { prisma } from "@/lib/db";
import { CategoryInput } from "@/lib/validations/categories";

const DEFAULT_CATEGORIES: { name: string; iconId: string }[] = [
  { name: "Alimentação", iconId: "utensils" },
  { name: "Moradia", iconId: "home" },
  { name: "Transporte", iconId: "bus" },
  { name: "Saúde", iconId: "heart-pulse" },
  { name: "Educação", iconId: "graduation-cap" },
  { name: "Lazer", iconId: "music" },
  { name: "Trabalho", iconId: "briefcase" },
  { name: "Poupança", iconId: "piggy-bank" },
  { name: "Outros", iconId: "tag" },
];

export async function seedDefaultCategories(userId: string): Promise<void> {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      icon: c.iconId,
    })),
    skipDuplicates: true,
  });
}

export interface UICategory {
  id: string;
  name: string;
  iconId: string | null;
  transactionCount: number;
}

export async function getUserCategories(userId: string): Promise<UICategory[]> {
  const records = await prisma.category.findMany({
    where: { userId },
    include: { _count: { select: { transactions: true } } },
    orderBy: { name: "asc" },
  });

  return records.map((c) => ({
    id: c.id,
    name: c.name,
    iconId: c.icon ?? null,
    transactionCount: c._count.transactions,
  }));
}

export async function createCategory(
  userId: string,
  data: CategoryInput,
): Promise<UICategory> {
  const record = await prisma.category.create({
    data: { userId, name: data.name, icon: data.iconId ?? null },
    include: { _count: { select: { transactions: true } } },
  });

  return {
    id: record.id,
    name: record.name,
    iconId: record.icon ?? null,
    transactionCount: record._count.transactions,
  };
}

export async function updateCategory(
  id: string,
  userId: string,
  data: CategoryInput,
): Promise<UICategory> {
  const record = await prisma.category.update({
    where: { id, userId },
    data: { name: data.name, icon: data.iconId ?? null },
    include: { _count: { select: { transactions: true } } },
  });

  return {
    id: record.id,
    name: record.name,
    iconId: record.icon ?? null,
    transactionCount: record._count.transactions,
  };
}

export async function deleteCategory(
  id: string,
  userId: string,
): Promise<void> {
  // Reassign linked transactions to a fallback "Sem categoria" before deleting.
  // This keeps data intact and avoids referential constraint errors.
  await prisma.$transaction(async (tx) => {
    // find or create fallback category for this user
    const fallbackName = "Sem categoria";
    let fallback = await tx.category.findFirst({
      where: { userId, name: fallbackName },
    });
    if (!fallback) {
      fallback = await tx.category.create({
        data: { userId, name: fallbackName, icon: null },
      });
    }

    // If the category being deleted is the same as fallback, just delete it (no-op reassignment)
    if (fallback.id !== id) {
      await tx.transaction.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallback.id },
      });
    }

    await tx.category.delete({ where: { id, userId } });
  });
}
