import { supabase } from "../supabase";

export async function fetchActiveMonth(userId) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("active_month")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.active_month || null;
}

export async function saveActiveMonth(userId, activeMonth) {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ user_id: userId, active_month: activeMonth, updated_at: new Date().toISOString() });
  if (error) throw error;
}
