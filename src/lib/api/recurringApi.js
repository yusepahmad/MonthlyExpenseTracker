import { supabase } from "../supabase";

export async function fetchRecurring(userId) {
  const { data, error } = await supabase.from("recurring").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertRecurring(userId, recurring) {
  const { error } = await supabase.from("recurring").insert(toRow(userId, recurring));
  if (error) throw error;
}

export async function updateRecurring(userId, recurring) {
  const { error } = await supabase
    .from("recurring")
    .update(toRow(userId, recurring))
    .eq("id", recurring.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteRecurring(userId, id) {
  const { error } = await supabase.from("recurring").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function replaceRecurring(userId, recurringList) {
  const { error: deleteError } = await supabase.from("recurring").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (recurringList.length === 0) return;

  const rows = recurringList.map((r) => toRow(userId, r));
  const { error: insertError } = await supabase.from("recurring").insert(rows);
  if (insertError) throw insertError;
}

function toRow(userId, r) {
  return {
    id: r.id,
    user_id: userId,
    name: r.name,
    category: r.category,
    amount: r.amount,
    frequency: r.frequency,
    day_of_month: r.day_of_month,
    is_active: r.is_active,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amount: Number(row.amount),
    frequency: row.frequency,
    day_of_month: row.day_of_month,
    is_active: row.is_active,
  };
}
