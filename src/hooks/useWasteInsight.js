import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useBudget } from "./useBudget";
import { nonEssentialTrend, totalBudgetOverspend, subscriptionsToReview } from "../lib/wasteInsight";

export function useWasteInsight() {
  const { state } = useApp();
  const budgetRows = useBudget();

  return useMemo(() => {
    const trend = nonEssentialTrend(state.transactions, state.activeMonth, state.customCategories);
    const overspend = totalBudgetOverspend(budgetRows);
    const subscriptions = subscriptionsToReview(state.recurring, state.transactions);

    return { trend, overspend, subscriptions };
  }, [state.transactions, state.activeMonth, state.customCategories, budgetRows, state.recurring]);
}
