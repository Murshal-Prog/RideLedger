import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-server";
import { ExpenseRepository } from "@/lib/repositories/expense-repository";
import { createExpenseSchema } from "@/lib/validations/expense";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const workSessionId = searchParams.get("workSessionId");

  const expenses = await ExpenseRepository.getExpenses(userId, workSessionId);
  return NextResponse.json({ expenses });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse();

  try {
    const body = await req.json();
    const validated = createExpenseSchema.parse(body);
    const expense = await ExpenseRepository.createExpense(userId, validated);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid expense data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
