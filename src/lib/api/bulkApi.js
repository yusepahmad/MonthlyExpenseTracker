import { supabase } from "../supabase";
import { replaceBudgets } from "./budgetsApi";
import { replaceRecurring } from "./recurringApi";
import { replaceCustomCategories } from "./categoriesApi";

// Excel import replaces the entire dataset — mirror that as a full
// delete-then-insert per table, same pattern as the bulk-replace helpers
// already used for budgets/recurring/categories.
export async function replaceAllFromExcelImport(userId, payload) {
  const { transactions, budgets, recurring, customCategories, savingsGoals, wishlist, accounts, challenges } = payload;

  const { error: deleteError } = await supabase.from("transactions").delete().eq("user_id", userId);
  if (deleteError) throw deleteError;

  if (transactions.length > 0) {
    const rows = transactions.map((t) => ({
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
      account: t.account || "acc_cash",
      transfer_id: t.transfer_id || null,
    }));
    const { error: insertError } = await supabase.from("transactions").insert(rows);
    if (insertError) throw insertError;
  }

  const { error: accountsDeleteError } = await supabase.from("accounts").delete().eq("user_id", userId);
  if (accountsDeleteError) throw accountsDeleteError;

  if (accounts && accounts.length > 0) {
    const accountRows = accounts.map((a) => ({
      id: a.id,
      user_id: userId,
      name: a.name,
      is_default: a.isDefault || false,
    }));
    const { error: accountsInsertError } = await supabase.from("accounts").insert(accountRows);
    if (accountsInsertError) throw accountsInsertError;
  }

  const { error: goalsDeleteError } = await supabase.from("savings_goals").delete().eq("user_id", userId);
  if (goalsDeleteError) throw goalsDeleteError;

  if (savingsGoals && savingsGoals.length > 0) {
    const goalRows = savingsGoals.map((g) => ({
      id: g.id,
      user_id: userId,
      name: g.name,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      deadline: g.deadline || null,
    }));
    const { error: goalsInsertError } = await supabase.from("savings_goals").insert(goalRows);
    if (goalsInsertError) throw goalsInsertError;
  }

  const { error: wishlistDeleteError } = await supabase.from("wishlist").delete().eq("user_id", userId);
  if (wishlistDeleteError) throw wishlistDeleteError;

  if (wishlist && wishlist.length > 0) {
    const wishlistRows = wishlist.map((w) => ({
      id: w.id,
      user_id: userId,
      name: w.name,
      price: w.price,
      priority: w.priority || "medium",
    }));
    const { error: wishlistInsertError } = await supabase.from("wishlist").insert(wishlistRows);
    if (wishlistInsertError) throw wishlistInsertError;
  }

  const { error: challengesDeleteError } = await supabase.from("challenges").delete().eq("user_id", userId);
  if (challengesDeleteError) throw challengesDeleteError;

  if (challenges && challenges.length > 0) {
    const challengeRows = challenges.map((c) => ({
      id: c.id,
      user_id: userId,
      type: c.type,
      category: c.category,
      target_amount: c.targetAmount ?? null,
      start_date: c.startDate,
      end_date: c.endDate,
    }));
    const { error: challengesInsertError } = await supabase.from("challenges").insert(challengeRows);
    if (challengesInsertError) throw challengesInsertError;
  }

  await Promise.all([
    replaceBudgets(userId, budgets),
    replaceRecurring(userId, recurring),
    replaceCustomCategories(userId, customCategories || []),
  ]);
}
