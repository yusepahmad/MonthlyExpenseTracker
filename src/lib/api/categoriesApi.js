import { supabase } from "../supabase";

export async function fetchCustomCategories(userId) {
  const { data, error } = await supabase.from("custom_categories").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map((row) => ({
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    subcategories: row.subcategories || [],
  }));
}

export async function insertCustomCategory(userId, category) {
  const { error } = await supabase.from("custom_categories").insert({
    user_id: userId,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    subcategories: category.subcategories || [],
  });
  if (error) throw error;
}

export async function upsertCategoryOverride(userId, originalName, category) {
  // Rename or edit: remove any row under the old name, then insert the
  // current shape under the new name (handles both in-place edits and
  // renames the same way, and works whether or not a row already existed).
  const { error: deleteError } = await supabase
    .from("custom_categories")
    .delete()
    .eq("user_id", userId)
    .ilike("name", originalName);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("custom_categories").insert({
    user_id: userId,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    subcategories: category.subcategories || [],
  });
  if (insertError) throw insertError;
}

export async function deleteCustomCategory(userId, name) {
  const { error } = await supabase
    .from("custom_categories")
    .delete()
    .eq("user_id", userId)
    .ilike("name", name);
  if (error) throw error;
}

export async function replaceCustomCategories(userId, categories) {
  const { error: deleteError } = await supabase.from("custom_categories").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;
  if (categories.length === 0) return;

  const rows = categories.map((c) => ({
    user_id: userId,
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
    subcategories: c.subcategories || [],
  }));
  const { error: insertError } = await supabase.from("custom_categories").insert(rows);
  if (insertError) throw insertError;
}
