import { Expense } from "@/lib/types/models";
import { createExpenseSchema, CreateExpenseInput } from "@/lib/validations/expense";
import { StorageAdapter, SecurityError } from "./storage-adapter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const ExpenseRepository = {
  async createExpense(userId: string, input: CreateExpenseInput): Promise<Expense> {
    if (!userId) throw new SecurityError("User ID is required to record an expense");
    const validated = createExpenseSchema.parse(input);

    const amountInr = Number(validated.amountInr.toFixed(2));
    const expenseTime = validated.expenseTime || new Date().toISOString();

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("expenses")
          .insert({
            user_id: userId,
            work_session_id: validated.workSessionId || null,
            expense_time: expenseTime,
            category: validated.category,
            custom_category: validated.customCategory || null,
            description: validated.description,
            amount_inr: amountInr,
            notes: validated.notes || null,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to record expense");
        }

        return {
          id: data.id,
          userId: data.user_id,
          workSessionId: data.work_session_id,
          expenseTime: data.expense_time,
          category: data.category,
          customCategory: data.custom_category,
          description: data.description,
          amountInr: Number(data.amount_inr),
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    const expense: Expense = {
      id: "exp-" + crypto.randomUUID(),
      userId,
      workSessionId: validated.workSessionId || null,
      expenseTime,
      category: validated.category,
      customCategory: validated.customCategory || null,
      description: validated.description,
      amountInr,
      notes: validated.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return StorageAdapter.saveExpense(userId, expense);
  },

  async getExpenses(userId: string, workSessionId?: string | null): Promise<Expense[]> {
    if (!userId) throw new SecurityError("User ID is required to fetch expenses");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        let query = supabase
          .from("expenses")
          .select("*")
          .eq("user_id", userId)
          .order("expense_time", { ascending: false });

        if (workSessionId) {
          query = query.eq("work_session_id", workSessionId);
        }

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map((d) => ({
          id: d.id,
          userId: d.user_id,
          workSessionId: d.work_session_id,
          expenseTime: d.expense_time,
          category: d.category,
          customCategory: d.custom_category,
          description: d.description,
          amountInr: Number(d.amount_inr),
          notes: d.notes,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    }

    return StorageAdapter.getExpenses(userId, workSessionId);
  },

  async getExpenseById(userId: string, expenseId: string): Promise<Expense | null> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .eq("id", expenseId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error || !data) return null;
        return {
          id: data.id,
          userId: data.user_id,
          workSessionId: data.work_session_id,
          expenseTime: data.expense_time,
          category: data.category,
          customCategory: data.custom_category,
          description: data.description,
          amountInr: Number(data.amount_inr),
          notes: data.notes,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    }

    return StorageAdapter.getExpenseById(userId, expenseId);
  },

  async deleteExpense(userId: string, expenseId: string): Promise<boolean> {
    if (!userId) throw new SecurityError("User ID is required");

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", expenseId)
          .eq("user_id", userId);
        return !error;
      }
    }

    return StorageAdapter.deleteExpense(userId, expenseId);
  },
};
