import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { shiftMonth } from "../lib/utils";

const TREND_PERCENT_THRESHOLD = 15;
const TREND_AMOUNT_THRESHOLD = 50000;

function sumByCategory(transactions) {
  const totals = {};
  transactions.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
  });
  return totals;
}

export function useInsights() {
  const { state } = useApp();

  return useMemo(() => {
    const monthTransactions = state.transactions.filter((t) => t.date.startsWith(state.activeMonth));

    const biggestExpense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((max, t) => (!max || Number(t.amount) > Number(max.amount) ? t : max), null);

    const biggestIncome = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((max, t) => (!max || Number(t.amount) > Number(max.amount) ? t : max), null);

    const previousMonth = shiftMonth(state.activeMonth, -1);
    const previousMonthTransactions = state.transactions.filter((t) => t.date.startsWith(previousMonth));

    const currentByCategory = sumByCategory(monthTransactions.filter((t) => t.type === "expense"));
    const previousByCategory = sumByCategory(previousMonthTransactions.filter((t) => t.type === "expense"));

    const categories = new Set([...Object.keys(currentByCategory), ...Object.keys(previousByCategory)]);

    const trends = Array.from(categories)
      .map((category) => {
        const current = currentByCategory[category] || 0;
        const previous = previousByCategory[category] || 0;
        const diff = current - previous;
        const percentChange = previous > 0 ? (diff / previous) * 100 : current > 0 ? 100 : 0;
        return { category, current, previous, diff, percentChange };
      })
      .filter(
        (t) => Math.abs(t.percentChange) >= TREND_PERCENT_THRESHOLD && Math.abs(t.diff) >= TREND_AMOUNT_THRESHOLD
      )
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return { biggestExpense, biggestIncome, trends };
  }, [state.transactions, state.activeMonth]);
}
