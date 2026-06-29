import { supabase } from "../supabase";

export async function fetchBudgets(userId) {
  const { data, error } = await supabase.from("budgets").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => ({ month: row.month, category: row.category, budget_amount: Number(row.budget_amount) }));
}

export async function replaceBudgets(userId, budgets) {
  const { error: deleteError } = await supabase.from("budgets").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (budgets.length === 0) return;

  const rows = budgets.map((b) => ({
    user_id: userId,
    month: b.month,
    category: b.category,
    budget_amount: b.budget_amount,
  }));
  const { error: insertError } = await supabase.from("budgets").insert(rows);
  if (insertError) throw insertError;
}
