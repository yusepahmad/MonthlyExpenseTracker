import { supabase } from "../supabase";

export async function fetchDebts(userId) {
  const { data, error } = await supabase.from("debts").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertDebt(userId, debt) {
  const { error } = await supabase.from("debts").insert(toRow(userId, debt));
  if (error) throw error;
}

export async function updateDebt(userId, debt) {
  const { error } = await supabase
    .from("debts")
    .update(toRow(userId, debt))
    .eq("id", debt.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteDebt(userId, id) {
  const { error } = await supabase.from("debts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, d) {
  return {
    id: d.id,
    user_id: userId,
    name: d.name,
    total_amount: d.totalAmount,
    remaining_amount: d.remainingAmount,
    due_date: d.dueDate || null,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    totalAmount: Number(row.total_amount),
    remainingAmount: Number(row.remaining_amount),
    dueDate: row.due_date || "",
  };
}
