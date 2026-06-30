import { supabase } from "../supabase";

export async function fetchChallenges(userId) {
  const { data, error } = await supabase.from("challenges").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertChallenge(userId, challenge) {
  const { error } = await supabase.from("challenges").insert(toRow(userId, challenge));
  if (error) throw error;
}

export async function updateChallenge(userId, challenge) {
  const { error } = await supabase
    .from("challenges")
    .update(toRow(userId, challenge))
    .eq("id", challenge.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteChallenge(userId, id) {
  const { error } = await supabase.from("challenges").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, c) {
  return {
    id: c.id,
    user_id: userId,
    type: c.type,
    category: c.category,
    target_amount: c.targetAmount ?? null,
    start_date: c.startDate,
    end_date: c.endDate,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    targetAmount: row.target_amount !== null ? Number(row.target_amount) : null,
    startDate: row.start_date,
    endDate: row.end_date,
  };
}
