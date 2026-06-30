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
    ...(row.overrides_default ? { overridesDefault: row.overrides_default } : {}),
    ...(row.type === "expense" ? { isEssential: row.is_essential ?? true } : {}),
    // Only set allocationPocket when this override row actually specifies
    // one. Omitting the key entirely (rather than defaulting to "living")
    // lets the merge in categories.js fall through to the underlying
    // default category's allocationPocket for older override rows created
    // before this column existed (e.g. an isEssential-only edit on
    // "Pendidikan" shouldn't silently flip it from "investment" to "living").
    ...(row.type === "expense" && row.allocation_pocket ? { allocationPocket: row.allocation_pocket } : {}),
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
    is_essential: category.type === "expense" ? category.isEssential ?? true : null,
    allocation_pocket: category.type === "expense" ? category.allocationPocket || "living" : null,
  });
  if (error) throw error;
}

export async function upsertCategoryOverride(userId, originalName, category) {
  // Rename or edit: remove the existing row, then insert the current shape
  // under the new name. For a default-category override, find that row by
  // `overrides_default` (stable across renames) rather than by `name` —
  // matching by name would miss it on a second rename and create a
  // duplicate row instead of replacing it.
  const deleteQuery = supabase.from("custom_categories").delete().eq("user_id", userId);
  const { error: deleteError } = category.overridesDefault
    ? await deleteQuery.ilike("overrides_default", category.overridesDefault)
    : await deleteQuery.ilike("name", originalName);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("custom_categories").insert({
    user_id: userId,
    name: category.name,
    type: category.type,
    color: category.color,
    icon: category.icon,
    subcategories: category.subcategories || [],
    overrides_default: category.overridesDefault || null,
    is_essential: category.type === "expense" ? category.isEssential ?? true : null,
    allocation_pocket: category.type === "expense" ? category.allocationPocket || "living" : null,
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
