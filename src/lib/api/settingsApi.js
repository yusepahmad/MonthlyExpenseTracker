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

export async function fetchAllocationSettings(userId) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("emergency_percent, investment_percent, living_percent, investment_value")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.emergency_percent === null) return null;
  return {
    emergencyPercent: Number(data.emergency_percent),
    investmentPercent: Number(data.investment_percent),
    livingPercent: Number(data.living_percent),
    investmentValue: data.investment_value !== null ? Number(data.investment_value) : null,
  };
}

export async function saveAllocationSettings(userId, settings) {
  const { error } = await supabase.from("app_settings").upsert({
    user_id: userId,
    emergency_percent: settings.emergencyPercent,
    investment_percent: settings.investmentPercent,
    living_percent: settings.livingPercent,
    investment_value: settings.investmentValue ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
