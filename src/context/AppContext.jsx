import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { getCurrentMonth } from "../lib/utils";
import { makeCustomCategoryColor, CUSTOM_CATEGORY_ICON, isCategoryNameTaken, getCategory } from "../lib/categories";
import { loadAllData, migrateLocalDataIfNeeded } from "../lib/api";
import { insertTransaction, updateTransaction as updateTransactionRow, deleteTransaction as deleteTransactionRow } from "../lib/api/transactionsApi";
import { replaceBudgets } from "../lib/api/budgetsApi";
import { insertRecurring, updateRecurring as updateRecurringRow, deleteRecurring as deleteRecurringRow } from "../lib/api/recurringApi";
import { insertCustomCategory, upsertCategoryOverride, deleteCustomCategory } from "../lib/api/categoriesApi";
import { insertSavingsGoal, updateSavingsGoal as updateSavingsGoalRow, deleteSavingsGoal as deleteSavingsGoalRow } from "../lib/api/savingsGoalsApi";
import { insertWishlistItem, updateWishlistItem as updateWishlistItemRow, deleteWishlistItem as deleteWishlistItemRow } from "../lib/api/wishlistApi";
import { insertAccount, updateAccount as updateAccountRow, deleteAccount as deleteAccountRow } from "../lib/api/accountsApi";
import { insertChallenge, updateChallenge as updateChallengeRow, deleteChallenge as deleteChallengeRow } from "../lib/api/challengesApi";
import { insertDebt, updateDebt as updateDebtRow, deleteDebt as deleteDebtRow } from "../lib/api/debtsApi";
import { saveActiveMonth, saveAllocationSettings } from "../lib/api/settingsApi";
import { replaceAllFromExcelImport } from "../lib/api/bulkApi";

export const DEFAULT_ACCOUNT_ID = "acc_cash";
const DEFAULT_ACCOUNT = { id: DEFAULT_ACCOUNT_ID, name: "Cash", isDefault: true };

// 20/10/70 rule from the user's reference: 20% emergency fund, 10%
// investment, 70% living costs — applied to total income for the month
// (every income transaction, not just a "gaji pokok" category).
export const DEFAULT_ALLOCATION_SETTINGS = {
  emergencyPercent: 20,
  investmentPercent: 10,
  livingPercent: 70,
};

const baseState = {
  transactions: [],
  budgets: [],
  recurring: [],
  customCategories: [],
  savingsGoals: [],
  wishlist: [],
  accounts: [DEFAULT_ACCOUNT],
  challenges: [],
  debts: [],
  allocationSettings: DEFAULT_ALLOCATION_SETTINGS,
  activeMonth: getCurrentMonth(),
  fileName: null,
};

// Old transactions (pre-Phase 9, local or cloud) have no `account` field —
// default them to Cash so every transaction always has a valid account.
function withAccountFallback(transactions) {
  return transactions.map((t) => (t.account ? t : { ...t, account: DEFAULT_ACCOUNT_ID }));
}

function withDefaultAccountSeed(accounts) {
  if (!accounts || accounts.length === 0) return [DEFAULT_ACCOUNT];
  if (accounts.some((a) => a.id === DEFAULT_ACCOUNT_ID)) return accounts;
  return [DEFAULT_ACCOUNT, ...accounts];
}

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_FROM_EXCEL":
      return {
        ...state,
        transactions: withAccountFallback(action.payload.transactions),
        budgets: action.payload.budgets,
        recurring: action.payload.recurring,
        customCategories: action.payload.customCategories || state.customCategories,
        savingsGoals: action.payload.savingsGoals || state.savingsGoals,
        wishlist: action.payload.wishlist || state.wishlist,
        accounts: withDefaultAccountSeed(action.payload.accounts || state.accounts),
        challenges: action.payload.challenges || state.challenges,
        debts: action.payload.debts || state.debts,
        allocationSettings: action.payload.allocationSettings || state.allocationSettings,
        fileName: action.payload.fileName,
      };
    case "LOAD_FROM_CLOUD":
      return {
        ...state,
        transactions: withAccountFallback(action.payload.transactions),
        budgets: action.payload.budgets,
        recurring: action.payload.recurring,
        customCategories: action.payload.customCategories,
        savingsGoals: action.payload.savingsGoals,
        accounts: withDefaultAccountSeed(action.payload.accounts),
        wishlist: action.payload.wishlist || [],
        challenges: action.payload.challenges || [],
        debts: action.payload.debts || [],
        allocationSettings: action.payload.allocationSettings || state.allocationSettings,
        activeMonth: action.payload.activeMonth || state.activeMonth,
      };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [...state.transactions, { ...action.payload, account: action.payload.account || DEFAULT_ACCOUNT_ID }],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    // A transfer between the user's own accounts is two linked transactions
    // (expense leg in the source account, income leg in the destination)
    // sharing a transfer_id — not a third transaction "type". This lets
    // every existing expense/income total stay correct without special-
    // casing transfers anywhere else: the two legs net to zero overall.
    case "ADD_TRANSFER": {
      const { fromAccount, toAccount, fromTransaction, toTransaction } = action.payload;
      return {
        ...state,
        transactions: [
          ...state.transactions,
          { ...fromTransaction, account: fromAccount },
          { ...toTransaction, account: toAccount },
        ],
      };
    }
    case "ADD_ACCOUNT":
      return { ...state, accounts: [...state.accounts, action.payload] };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) => (a.id === action.payload.id ? { ...a, ...action.payload } : a)),
      };
    case "DELETE_ACCOUNT": {
      const id = action.payload;
      if (id === DEFAULT_ACCOUNT_ID) return state; // default Cash account can't be removed
      const stillInUse = state.transactions.some((t) => t.account === id);
      if (stillInUse) return state; // reassign or delete those transactions first
      return { ...state, accounts: state.accounts.filter((a) => a.id !== id) };
    }
    case "SET_BUDGETS":
      return { ...state, budgets: action.payload };
    case "SET_RECURRING":
      return { ...state, recurring: action.payload };
    case "ADD_RECURRING":
      return { ...state, recurring: [...state.recurring, action.payload] };
    case "UPDATE_RECURRING":
      return {
        ...state,
        recurring: state.recurring.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        ),
      };
    case "DELETE_RECURRING":
      return { ...state, recurring: state.recurring.filter((r) => r.id !== action.payload) };
    case "SET_ACTIVE_MONTH":
      return { ...state, activeMonth: action.payload };
    case "ADD_SAVINGS_GOAL":
      return { ...state, savingsGoals: [...state.savingsGoals, action.payload] };
    case "UPDATE_SAVINGS_GOAL":
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      };
    case "DELETE_SAVINGS_GOAL":
      return { ...state, savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload) };
    case "ADD_WISHLIST_ITEM":
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    case "UPDATE_WISHLIST_ITEM":
      return {
        ...state,
        wishlist: state.wishlist.map((w) =>
          w.id === action.payload.id ? { ...w, ...action.payload } : w
        ),
      };
    case "DELETE_WISHLIST_ITEM":
      return { ...state, wishlist: state.wishlist.filter((w) => w.id !== action.payload) };
    case "ADD_CHALLENGE":
      return { ...state, challenges: [...state.challenges, action.payload] };
    case "UPDATE_CHALLENGE":
      return {
        ...state,
        challenges: state.challenges.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)),
      };
    case "DELETE_CHALLENGE":
      return { ...state, challenges: state.challenges.filter((c) => c.id !== action.payload) };
    case "ADD_DEBT":
      return { ...state, debts: [...state.debts, action.payload] };
    case "UPDATE_DEBT":
      return {
        ...state,
        debts: state.debts.map((d) => (d.id === action.payload.id ? { ...d, ...action.payload } : d)),
      };
    case "DELETE_DEBT":
      return { ...state, debts: state.debts.filter((d) => d.id !== action.payload) };
    case "SET_ALLOCATION_SETTINGS":
      return { ...state, allocationSettings: action.payload };
    case "ADD_CATEGORY": {
      const { name, type, subcategories, icon } = action.payload;
      if (isCategoryNameTaken(name, state.customCategories)) return state;
      const category = {
        name,
        type,
        subcategories: subcategories || [],
        color: makeCustomCategoryColor(state.customCategories, name),
        icon: icon || CUSTOM_CATEGORY_ICON,
      };
      return { ...state, customCategories: [...state.customCategories, category] };
    }
    case "UPDATE_CATEGORY": {
      const { originalName, overridesDefault, name, type, color, icon, subcategories } = action.payload;

      // Renaming to a name that's already taken by something else isn't allowed.
      if (isCategoryNameTaken(name, state.customCategories, originalName)) return state;

      // `overridesDefault` is the stable link to a built-in default category,
      // passed by the caller (it knows whether it's editing a default-derived
      // row). Matching by current name would lose track of it across renames.
      const existingOverride = overridesDefault
        ? state.customCategories.find((c) => (c.overridesDefault || "").toLowerCase() === overridesDefault.toLowerCase())
        : state.customCategories.find((c) => c.name.toLowerCase() === originalName.toLowerCase());

      const updated = {
        name,
        type,
        color,
        icon,
        subcategories: subcategories || [],
        ...(overridesDefault ? { overridesDefault } : {}),
      };

      if (existingOverride) {
        const next = state.customCategories.map((c) => (c === existingOverride ? updated : c));
        return { ...state, customCategories: next };
      }

      // Editing a built-in default category for the first time — store it
      // as an override entry rather than mutating DEFAULT_CATEGORIES.
      return { ...state, customCategories: [...state.customCategories, updated] };
    }
    case "DELETE_CATEGORY": {
      const name = action.payload;
      const target = getCategory(name, state.customCategories);
      if (!target || target.isDefault) return state; // default categories (even renamed) can be edited, not removed
      return {
        ...state,
        customCategories: state.customCategories.filter((c) => c.name.toLowerCase() !== name.toLowerCase()),
      };
    }
    default:
      return state;
  }
}

// Fire-and-forget cloud sync for each action — keeps the reducer instantly
// responsive (no loading spinners on every click) while persisting to
// Supabase in the background. Errors are logged, not surfaced as UI
// blockers, since the optimistic local state already reflects the change.
function syncToCloud(userId, action) {
  if (!userId) return;

  const run = async () => {
    switch (action.type) {
      case "LOAD_FROM_EXCEL":
        return replaceAllFromExcelImport(userId, action.payload);
      case "ADD_TRANSACTION":
        return insertTransaction(userId, action.payload);
      case "UPDATE_TRANSACTION":
        return updateTransactionRow(userId, action.payload);
      case "DELETE_TRANSACTION":
        return deleteTransactionRow(userId, action.payload);
      case "SET_BUDGETS":
        return replaceBudgets(userId, action.payload);
      case "ADD_RECURRING":
        return insertRecurring(userId, action.payload);
      case "UPDATE_RECURRING":
        return updateRecurringRow(userId, action.payload);
      case "DELETE_RECURRING":
        return deleteRecurringRow(userId, action.payload);
      case "ADD_SAVINGS_GOAL":
        return insertSavingsGoal(userId, action.payload);
      case "UPDATE_SAVINGS_GOAL":
        return updateSavingsGoalRow(userId, action.payload);
      case "DELETE_SAVINGS_GOAL":
        return deleteSavingsGoalRow(userId, action.payload);
      case "ADD_WISHLIST_ITEM":
        return insertWishlistItem(userId, action.payload);
      case "UPDATE_WISHLIST_ITEM":
        return updateWishlistItemRow(userId, action.payload);
      case "DELETE_WISHLIST_ITEM":
        return deleteWishlistItemRow(userId, action.payload);
      case "ADD_TRANSFER":
        return Promise.all([
          insertTransaction(userId, { ...action.payload.fromTransaction, account: action.payload.fromAccount }),
          insertTransaction(userId, { ...action.payload.toTransaction, account: action.payload.toAccount }),
        ]);
      case "ADD_ACCOUNT":
        return insertAccount(userId, action.payload);
      case "UPDATE_ACCOUNT":
        return updateAccountRow(userId, action.payload);
      case "DELETE_ACCOUNT":
        return deleteAccountRow(userId, action.payload);
      case "ADD_CHALLENGE":
        return insertChallenge(userId, action.payload);
      case "UPDATE_CHALLENGE":
        return updateChallengeRow(userId, action.payload);
      case "DELETE_CHALLENGE":
        return deleteChallengeRow(userId, action.payload);
      case "ADD_DEBT":
        return insertDebt(userId, action.payload);
      case "UPDATE_DEBT":
        return updateDebtRow(userId, action.payload);
      case "DELETE_DEBT":
        return deleteDebtRow(userId, action.payload);
      case "SET_ALLOCATION_SETTINGS":
        return saveAllocationSettings(userId, action.payload);
      case "ADD_CATEGORY":
        return insertCustomCategory(userId, action.payload);
      case "UPDATE_CATEGORY":
        return upsertCategoryOverride(userId, action.payload.originalName, action.payload);
      case "DELETE_CATEGORY":
        return deleteCustomCategory(userId, action.payload);
      case "SET_ACTIVE_MONTH":
        return saveActiveMonth(userId, action.payload);
      default:
        return null;
    }
  };

  run().catch((err) => console.error("Cloud sync failed for", action.type, err));
}

const AppContext = createContext(null);

export function AppProvider({ children, userId }) {
  const [state, dispatch] = useReducer(reducer, baseState);
  const [isLoading, setIsLoading] = useState(true);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        await migrateLocalDataIfNeeded(userId);
        const cloudData = await loadAllData(userId);
        if (!cancelled) {
          dispatch({ type: "LOAD_FROM_CLOUD", payload: cloudData });
        }
      } catch (err) {
        console.error("Failed to load cloud data", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function dispatchWithSync(action) {
    dispatch(action);
    syncToCloud(userIdRef.current, action);
  }

  return (
    <AppContext.Provider value={{ state, dispatch: dispatchWithSync, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
