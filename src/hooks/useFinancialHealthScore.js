import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useBudget } from "./useBudget";
import { useCashFlowPrediction } from "./useCashFlowPrediction";
import { excludeTransfers } from "../lib/utils";

const WEIGHT = 20; // 5 factors x 20 points = 100
const STABILITY_LOOKBACK_MONTHS = 6;

function monthKey(date) {
  return date.slice(0, 7);
}

function shiftMonthKey(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 1. Savings rate: (income - expense) / income this month.
function scoreSavingsRate(transactions, activeMonth) {
  const monthTx = transactions.filter((t) => t.date.startsWith(activeMonth));
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  if (income <= 0) return { points: 0, value: null, hasData: false };

  const rate = (income - expense) / income;
  const points = Math.max(0, Math.min(WEIGHT, rate * WEIGHT));
  return { points, value: rate, hasData: true };
}

// 2. Budget adherence: % of budgeted categories not over their limit.
function scoreBudgetAdherence(budgetRows) {
  const withLimit = budgetRows.filter((b) => b.limit !== null);
  if (withLimit.length === 0) return { points: WEIGHT * 0.5, value: null, hasData: false };

  const withinBudget = withLimit.filter((b) => !b.isOverBudget).length;
  const ratio = withinBudget / withLimit.length;
  return { points: ratio * WEIGHT, value: ratio, hasData: true };
}

// 3. Cashflow trend: reuse useCashFlowPrediction's burn rate sign/magnitude.
function scoreCashflowTrend(cashFlow) {
  if (!cashFlow.hasEnoughData) return { points: WEIGHT * 0.5, value: null, hasData: false };

  if (cashFlow.isPositiveTrend) return { points: WEIGHT, value: cashFlow.netBurnPerDay, hasData: true };

  // Negative trend: scale down based on how fast balance is burning
  // relative to the balance itself (severe burn = lower score).
  const severity = cashFlow.balance > 0 ? Math.min(1, (cashFlow.netBurnPerDay * 30) / cashFlow.balance) : 1;
  const points = WEIGHT * (1 - severity);
  return { points: Math.max(0, points), value: cashFlow.netBurnPerDay, hasData: true };
}

// 4. Spending stability: lower coefficient of variation across recent
// months' total expense = more predictable spending = higher score.
function scoreSpendingStability(transactions, activeMonth) {
  const monthlyTotals = [];
  for (let i = 0; i < STABILITY_LOOKBACK_MONTHS; i++) {
    const key = shiftMonthKey(activeMonth, -i);
    const total = transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === key)
      .reduce((s, t) => s + Number(t.amount), 0);
    if (total > 0) monthlyTotals.push(total);
  }

  if (monthlyTotals.length < 2) return { points: WEIGHT * 0.5, value: null, hasData: false };

  const mean = monthlyTotals.reduce((s, v) => s + v, 0) / monthlyTotals.length;
  const variance = monthlyTotals.reduce((s, v) => s + (v - mean) ** 2, 0) / monthlyTotals.length;
  const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 0;

  // CV of 0 (perfectly stable) = full points; CV >= 0.5 = 0 points.
  const points = Math.max(0, WEIGHT * (1 - coefficientOfVariation / 0.5));
  return { points, value: coefficientOfVariation, hasData: true };
}

// 5. Debt ratio: total remaining debt / this month's income.
function scoreDebtRatio(debts, transactions, activeMonth) {
  if (debts.length === 0) return { points: WEIGHT, value: 0, hasData: true, noDebt: true };

  const totalRemaining = debts.reduce((s, d) => s + Number(d.remainingAmount), 0);
  const monthIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(activeMonth))
    .reduce((s, t) => s + Number(t.amount), 0);

  if (monthIncome <= 0) return { points: 0, value: null, hasData: false };

  const ratio = totalRemaining / monthIncome;
  // Ratio of 0 = full points; ratio >= 3x monthly income = 0 points.
  const points = Math.max(0, WEIGHT * (1 - ratio / 3));
  return { points, value: ratio, hasData: true };
}

export function useFinancialHealthScore() {
  const { state } = useApp();
  const budgetRows = useBudget();
  const cashFlow = useCashFlowPrediction();

  return useMemo(() => {
    const realTransactions = excludeTransfers(state.transactions);

    const savingsRate = scoreSavingsRate(realTransactions, state.activeMonth);
    const budgetAdherence = scoreBudgetAdherence(budgetRows);
    const cashflowTrend = scoreCashflowTrend(cashFlow);
    const spendingStability = scoreSpendingStability(realTransactions, state.activeMonth);
    const debtRatio = scoreDebtRatio(state.debts, realTransactions, state.activeMonth);

    const factors = { savingsRate, budgetAdherence, cashflowTrend, spendingStability, debtRatio };
    const score = Math.round(
      Object.values(factors).reduce((sum, f) => sum + f.points, 0)
    );

    return { score, factors };
  }, [state.transactions, state.activeMonth, state.debts, budgetRows, cashFlow]);
}
