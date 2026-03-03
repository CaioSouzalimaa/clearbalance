import { prisma } from "@/lib/db";
import { GoalInput, ContributionInput } from "@/lib/validations/goals";
import { Prisma, TransactionType, RecurrenceMode } from "@prisma/client";

export interface UIGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  progress: number;
  createdAt: string;
}

function mapDbToUI(goal: {
  id: string;
  name: string;
  targetAmount: Prisma.Decimal;
  currentAmount: Prisma.Decimal;
  deadline: Date | null;
  createdAt: Date;
}): UIGoal {
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const progress =
    target > 0 ? Math.round((current / target) * 100) : 0;

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: target,
    currentAmount: current,
    deadline: goal.deadline ? goal.deadline.toISOString().split("T")[0] : null,
    progress,
    createdAt: goal.createdAt.toISOString(),
  };
}

export async function getUserGoals(userId: string): Promise<UIGoal[]> {
  const records = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapDbToUI);
}

export async function createGoal(
  userId: string,
  data: GoalInput,
): Promise<UIGoal> {
  const record = await prisma.goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: new Prisma.Decimal(data.targetAmount),
      currentAmount: new Prisma.Decimal(0),
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return mapDbToUI(record);
}

export async function updateGoal(
  id: string,
  userId: string,
  data: GoalInput,
): Promise<UIGoal> {
  const record = await prisma.goal.update({
    where: { id, userId },
    data: {
      name: data.name,
      targetAmount: new Prisma.Decimal(data.targetAmount),
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return mapDbToUI(record);
}

export async function deleteGoal(id: string, userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Get the goal to know its name
    const goal = await tx.goal.findUnique({ where: { id, userId } });
    if (!goal) throw new Error("Meta não encontrada");

    // 2. Delete all contribution transactions for this goal
    await tx.transaction.deleteMany({
      where: {
        userId,
        description: `Aporte - ${goal.name}`,
      },
    });

    // 3. Delete the goal
    await tx.goal.delete({ where: { id, userId } });
  });
}

/**
 * Register a contribution to a goal and create a corresponding expense transaction.
 * The transaction is created in a "Meta" category (or "Investimentos" if you prefer).
 */
export async function addContribution(
  id: string,
  userId: string,
  data: ContributionInput,
): Promise<UIGoal> {
  const amount = new Prisma.Decimal(data.amount);

  return await prisma.$transaction(async (tx) => {
    // 1. Get the goal
    const goal = await tx.goal.findUnique({ where: { id, userId } });
    if (!goal) throw new Error("Meta não encontrada");

    // 2. Calculate new current amount (no cap — contributions beyond target are allowed)
    const newCurrent = Prisma.Decimal.add(goal.currentAmount, amount);

    // 3. Update the goal
    const updatedGoal = await tx.goal.update({
      where: { id, userId },
      data: { currentAmount: newCurrent },
    });

    // 4. Find or create a "Metas" category
    let category = await tx.category.findFirst({
      where: { userId, name: "Metas" },
    });

    if (!category) {
      category = await tx.category.create({
        data: { userId, name: "Metas", icon: "flag" },
      });
    }

    // 5. Create an expense transaction for the contribution
    await tx.transaction.create({
      data: {
        userId,
        categoryId: category.id,
        description: `Aporte - ${goal.name}`,
        amount,
        date: new Date(),
        type: TransactionType.EXPENSE,
        recurrenceMode: RecurrenceMode.NONE,
        isSettled: true,
        paymentDate: new Date(),
      },
    });

    return mapDbToUI(updatedGoal);
  });
}
