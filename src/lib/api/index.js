import { fetchTransactions, insertTransaction } from "./transactionsApi";
import { fetchBudgets, replaceBudgets } from "./budgetsApi";
import { fetchRecurring, replaceRecurring } from "./recurringApi";
import { fetchCustomCategories, replaceCustomCategories } from "./categoriesApi";
import { fetchSavingsGoals, insertSavingsGoal } from "./savingsGoalsApi";
import { fetchWishlist, insertWishlistItem } from "./wishlistApi";
import { fetchAccounts, insertAccount } from "./accountsApi";
import { fetchActiveMonth, saveActiveMonth } from "./settingsApi";
import { loadState as loadLocalState } from "../storage";

const MIGRATION_FLAG_KEY = "expense-tracker-migrated-to-cloud";

export async function loadAllData(userId) {
  const [transactions, budgets, recurring, customCategories, savingsGoals, wishlist, accounts, activeMonth] = await Promise.all([
    fetchTransactions(userId),
    fetchBudgets(userId),
    fetchRecurring(userId),
    fetchCustomCategories(userId),
    fetchSavingsGoals(userId),
    fetchWishlist(userId),
    fetchAccounts(userId),
    fetchActiveMonth(userId),
  ]);

  return { transactions, budgets, recurring, customCategories, savingsGoals, wishlist, accounts, activeMonth };
}

// One-time migration: if this browser has localStorage data from before
// cloud sync existed, and it hasn't been migrated yet, push it up to
// Supabase so the user doesn't lose their existing records.
export async function migrateLocalDataIfNeeded(userId) {
  const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG_KEY) === userId;
  if (alreadyMigrated) return false;

  const local = loadLocalState();
  if (!local || !local.transactions || local.transactions.length === 0) {
    localStorage.setItem(MIGRATION_FLAG_KEY, userId);
    return false;
  }

  await Promise.all([
    ...local.transactions.map((t) => insertTransaction(userId, t)),
    replaceBudgets(userId, local.budgets || []),
    replaceRecurring(userId, local.recurring || []),
    replaceCustomCategories(userId, local.customCategories || []),
    ...(local.savingsGoals || []).map((g) => insertSavingsGoal(userId, g)),
    ...(local.wishlist || []).map((w) => insertWishlistItem(userId, w)),
    ...(local.accounts || []).map((a) => insertAccount(userId, a)),
    local.activeMonth ? saveActiveMonth(userId, local.activeMonth) : Promise.resolve(),
  ]);

  localStorage.setItem(MIGRATION_FLAG_KEY, userId);
  return true;
}
