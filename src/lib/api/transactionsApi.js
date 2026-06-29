import { supabase } from "../supabase";

export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertTransaction(userId, transaction) {
  const { error } = await supabase.from("transactions").insert(toRow(userId, transaction));
  if (error) throw error;
}

export async function updateTransaction(userId, transaction) {
  const { error } = await supabase
    .from("transactions")
    .update(toRow(userId, transaction))
    .eq("id", transaction.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteTransaction(userId, id) {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, t) {
  return {
    id: t.id,
    user_id: userId,
    date: t.date,
    category: t.category,
    subcategory: t.subcategory || "",
    amount: t.amount,
    type: t.type,
    description: t.description || "",
    is_recurring: t.is_recurring || false,
    recurring_id: t.recurring_id || null,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    date: row.date,
    category: row.category,
    subcategory: row.subcategory || "",
    amount: Number(row.amount),
    type: row.type,
    description: row.description || "",
    is_recurring: row.is_recurring,
    recurring_id: row.recurring_id,
  };
}
