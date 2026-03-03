import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { contributionInputSchema } from "@/lib/validations/goals";
import { withdrawFromGoal } from "@/lib/goals";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = contributionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const goal = await withdrawFromGoal(id, session.user.id, parsed.data);
    return NextResponse.json(goal);
  } catch (error) {
    console.error(`[POST /api/goals/${id}/withdraw]`, error);
    const message = error instanceof Error ? error.message : "Erro interno do servidor";
    const isValidation = message.startsWith("O valor");
    return NextResponse.json(
      { error: message },
      { status: isValidation ? 400 : 500 },
    );
  }
}
