import { createContext, useContext, useEffect, useReducer } from "react";
import { getCurrentMonth } from "../lib/utils";
import { loadState, saveState } from "../lib/storage";
import { makeCustomCategoryColor, CUSTOM_CATEGORY_ICON } from "../lib/categories";

const baseState = {
  transactions: [],
  budgets: [],
  recurring: [],
  customCategories: [],
  savingsGoals: [],
  activeMonth: getCurrentMonth(),
  fileName: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_FROM_EXCEL":
      return {
        ...state,
        transactions: action.payload.transactions,
        budgets: action.payload.budgets,
        recurring: action.payload.recurring,
        customCategories: action.payload.customCategories || state.customCategories,
        savingsGoals: action.payload.savingsGoals || state.savingsGoals,
        fileName: action.payload.fileName,
      };
    case "LOAD_FROM_STORAGE":
      return { ...state, ...action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case "UPDATE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
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
      return {
        ...state,
        recurring: state.recurring.filter((r) => r.id !== action.payload),
      };
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
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload),
      };
    case "ADD_CATEGORY": {
      const { name, type, subcategories, icon } = action.payload;
      if (state.customCategories.some((c) => c.name === name)) return state;
      const category = {
        name,
        type,
        subcategories: subcategories || [],
        color: makeCustomCategoryColor(state.customCategories.length),
        icon: icon || CUSTOM_CATEGORY_ICON,
      };
      return { ...state, customCategories: [...state.customCategories, category] };
    }
    default:
      return state;
  }
}

function init() {
  const persisted = loadState();
  return persisted ? { ...baseState, ...persisted } : baseState;
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
