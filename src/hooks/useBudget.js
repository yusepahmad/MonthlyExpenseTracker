import { useMemo } from "react";
import { useApp } from "../context/AppContext";

export function useBudget() {
  const { state } = useApp();

  return useMemo(() => {
    const monthTransactions = state.transactions.filter(
      (t) => t.type === "expense" && t.date.startsWith(state.activeMonth)
    );
    const monthBudgets = state.budgets.filter((b) => b.month === state.activeMonth);

    const spentByCategory = {};
    monthTransactions.forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
    });

    const categories = new Set([
      ...monthBudgets.map((b) => b.category),
      ...Object.keys(spentByCategory),
    ]);

    return Array.from(categories).map((category) => {
      const budget = monthBudgets.find((b) => b.category === category);
      const spent = spentByCategory[category] || 0;
      const limit = budget ? Number(budget.budget_amount) : null;
      const rawPercentage = limit ? (spent / limit) * 100 : null;
      const isOverBudget = limit !== null && spent > limit;
      return {
        category,
        spent,
        limit,
        percentage: rawPercentage !== null ? Math.min(rawPercentage, 100) : null,
        rawPercentage,
        isOverBudget,
        alertLevel: isOverBudget ? "exceeded" : rawPercentage >= 80 ? "warning" : "ok",
      };
    });
  }, [state.transactions, state.budgets, state.activeMonth]);
}
