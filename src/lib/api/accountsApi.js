import { supabase } from "../supabase";

export async function fetchAccounts(userId) {
  const { data, error } = await supabase.from("accounts").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertAccount(userId, account) {
  const { error } = await supabase.from("accounts").insert(toRow(userId, account));
  if (error) throw error;
}

export async function updateAccount(userId, account) {
  const { error } = await supabase
    .from("accounts")
    .update(toRow(userId, account))
    .eq("id", account.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteAccount(userId, id) {
  const { error } = await supabase.from("accounts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, a) {
  return {
    id: a.id,
    user_id: userId,
    name: a.name,
    is_default: a.isDefault || false,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.is_default,
  };
}
