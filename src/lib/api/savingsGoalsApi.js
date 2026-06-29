import { supabase } from "../supabase";

export async function fetchSavingsGoals(userId) {
  const { data, error } = await supabase.from("savings_goals").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertSavingsGoal(userId, goal) {
  const { error } = await supabase.from("savings_goals").insert(toRow(userId, goal));
  if (error) throw error;
}

export async function updateSavingsGoal(userId, goal) {
  const { error } = await supabase
    .from("savings_goals")
    .update(toRow(userId, goal))
    .eq("id", goal.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteSavingsGoal(userId, id) {
  const { error } = await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, g) {
  return {
    id: g.id,
    user_id: userId,
    name: g.name,
    target_amount: g.targetAmount,
    current_amount: g.currentAmount,
    deadline: g.deadline || null,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    deadline: row.deadline || "",
  };
}
