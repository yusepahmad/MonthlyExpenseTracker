import { useMemo } from "react";
import { useApp } from "../context/AppContext";

const LOOKBACK_DAYS = 30;

export function useCashFlowPrediction() {
  const { state } = useApp();

  return useMemo(() => {
    const balance = state.transactions.reduce(
      (sum, t) => sum + (t.type === "income" ? Number(t.amount) : -Number(t.amount)),
      0
    );

    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recentTransactions = state.transactions.filter((t) => t.date >= cutoffStr);
    const recentExpense = recentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const recentIncome = recentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBurnPerDay = (recentExpense - recentIncome) / LOOKBACK_DAYS;

    let daysUntilZero = null;
    if (netBurnPerDay > 0 && balance > 0) {
      daysUntilZero = Math.floor(balance / netBurnPerDay);
    }

    return {
      balance,
      netBurnPerDay,
      daysUntilZero,
      isPositiveTrend: netBurnPerDay <= 0,
      hasEnoughData: recentTransactions.length > 0,
    };
  }, [state.transactions]);
}
