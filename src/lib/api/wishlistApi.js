import { supabase } from "../supabase";

export async function fetchWishlist(userId) {
  const { data, error } = await supabase.from("wishlist").select("*").eq("user_id", userId);
  if (error) throw error;
  return data.map(fromRow);
}

export async function insertWishlistItem(userId, item) {
  const { error } = await supabase.from("wishlist").insert(toRow(userId, item));
  if (error) throw error;
}

export async function updateWishlistItem(userId, item) {
  const { error } = await supabase
    .from("wishlist")
    .update(toRow(userId, item))
    .eq("id", item.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteWishlistItem(userId, id) {
  const { error } = await supabase.from("wishlist").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

function toRow(userId, w) {
  return {
    id: w.id,
    user_id: userId,
    name: w.name,
    price: w.price,
    priority: w.priority || "medium",
  };
}

function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    priority: row.priority || "medium",
  };
}
