import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { startOfWeek, toDateStr, excludeTransfers } from "../lib/utils";
import { calculateAllocation } from "../lib/allocation";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function filterByPeriod(transactions, period, referenceDate, customRange) {
  if (period === "custom") {
    if (!customRange?.from || !customRange?.to) return [];
    return transactions.filter((t) => t.date >= customRange.from && t.date <= customRange.to);
  }
  if (period === "week") {
    const start = startOfWeek(referenceDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startStr = toDateStr(start);
    const endStr = toDateStr(end);
    return transactions.filter((t) => t.date >= startStr && t.date <= endStr);
  }
  if (period === "year") {
    const year = String(referenceDate.getFullYear());
    return transactions.filter((t) => t.date.startsWith(year));
  }
  // month
  const month = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
  return transactions.filter((t) => t.date.startsWith(month));
}

function buildCategoryTotals(transactions) {
  const totals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      totals[t.category] = (totals[t.category] || 0) + Number(t.amount);
    });
  return Object.entries(totals)
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

function buildDailySeries(transactions, referenceDate) {
  const start = startOfWeek(referenceDate);
  const buckets = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const dateStr = toDateStr(day);
    const expense = transactions
      .filter((t) => t.date === dateStr && t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const income = transactions
      .filter((t) => t.date === dateStr && t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    buckets.push({ label: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][day.getDay()], expense, income });
  }
  return buckets;
}

function buildMonthlySeries(transactions, year) {
  const buckets = [];
  for (let m = 0; m < 12; m++) {
    const monthStr = `${year}-${String(m + 1).padStart(2, "0")}`;
    const expense = transactions
      .filter((t) => t.date.startsWith(monthStr) && t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const income = transactions
      .filter((t) => t.date.startsWith(monthStr) && t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    buckets.push({ label: MONTH_LABELS[m], expense, income });
  }
  return buckets;
}

function buildDailyOfMonthSeries(transactions, referenceDate) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const buckets = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const expense = transactions
      .filter((t) => t.date === dateStr && t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const income = transactions
      .filter((t) => t.date === dateStr && t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    buckets.push({ label: String(d), expense, income });
  }
  return buckets;
}

// Daily series for an arbitrary custom range — used instead of the
// week/month/year-specific bucketers above when period === "custom".
function buildRangeSeries(transactions, fromStr, toStr) {
  const buckets = [];
  const from = new Date(fromStr);
  const to = new Date(toStr);
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const dateStr = toDateStr(d);
    const expense = transactions
      .filter((t) => t.date === dateStr && t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const income = transactions
      .filter((t) => t.date === dateStr && t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    buckets.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, expense, income });
  }
  return buckets;
}

// Per-category budget rows for an arbitrary set of months (a custom range
// can span several months) — sums spent vs the budget limit set for each
// month/category pair actually inside the range.
function buildBudgetReport(transactions, budgets, monthsInRange) {
  const realTransactions = excludeTransfers(transactions);
  const relevantBudgets = budgets.filter((b) => monthsInRange.includes(b.month));

  const spentByCategory = {};
  realTransactions
    .filter((t) => t.type === "expense" && monthsInRange.includes(t.date.slice(0, 7)))
    .forEach((t) => {
      spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
    });

  const limitByCategory = {};
  relevantBudgets.forEach((b) => {
    limitByCategory[b.category] = (limitByCategory[b.category] || 0) + Number(b.budget_amount);
  });

  const categories = new Set([...Object.keys(spentByCategory), ...Object.keys(limitByCategory)]);
  return Array.from(categories)
    .map((category) => {
      const spent = spentByCategory[category] || 0;
      const limit = limitByCategory[category] || null;
      return { category, spent, limit, isOverBudget: limit !== null && spent > limit };
    })
    .sort((a, b) => b.spent - a.spent);
}

function monthsBetween(fromStr, toStr) {
  const months = new Set();
  const from = new Date(fromStr);
  const to = new Date(toStr);
  for (let d = new Date(from.getFullYear(), from.getMonth(), 1); d <= to; d.setMonth(d.getMonth() + 1)) {
    months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return Array.from(months);
}

export function useReportData(period, referenceDate = new Date(), customRange = null) {
  const { state } = useApp();

  return useMemo(() => {
    const realTransactions = excludeTransfers(state.transactions);
    const periodTransactions = filterByPeriod(realTransactions, period, referenceDate, customRange);

    const totalExpense = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    const categoryTotals = buildCategoryTotals(periodTransactions);

    let series;
    let fromLabel;
    let toLabel;
    let monthsInRange;

    if (period === "week") {
      series = buildDailySeries(realTransactions, referenceDate);
      const start = startOfWeek(referenceDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      fromLabel = toDateStr(start);
      toLabel = toDateStr(end);
      monthsInRange = monthsBetween(fromLabel, toLabel);
    } else if (period === "year") {
      series = buildMonthlySeries(realTransactions, referenceDate.getFullYear());
      fromLabel = `${referenceDate.getFullYear()}-01-01`;
      toLabel = `${referenceDate.getFullYear()}-12-31`;
      monthsInRange = monthsBetween(fromLabel, toLabel);
    } else if (period === "custom" && customRange?.from && customRange?.to) {
      series = buildRangeSeries(realTransactions, customRange.from, customRange.to);
      fromLabel = customRange.from;
      toLabel = customRange.to;
      monthsInRange = monthsBetween(fromLabel, toLabel);
    } else {
      series = buildDailyOfMonthSeries(realTransactions, referenceDate);
      const month = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
      fromLabel = `${month}-01`;
      toLabel = toDateStr(new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0));
      monthsInRange = [month];
    }

    const budgetReport = buildBudgetReport(state.transactions, state.budgets, monthsInRange || []);

    // Allocation (20/10/70) only makes sense per-month — for a multi-month
    // range, show one snapshot per month inside the range rather than
    // trying to average/sum percentages across months.
    const allocationByMonth = (monthsInRange || []).map((month) =>
      calculateAllocation(state.transactions, month, state.allocationSettings, state.customCategories)
    );

    return {
      totalExpense,
      totalIncome,
      categoryTotals,
      series,
      periodTransactions,
      fromLabel,
      toLabel,
      budgetReport,
      allocationByMonth,
      allocationMonthLabels: monthsInRange || [],
      savingsGoals: state.savingsGoals,
      debts: state.debts,
    };
  }, [
    state.transactions,
    state.budgets,
    state.allocationSettings,
    state.customCategories,
    state.savingsGoals,
    state.debts,
    period,
    referenceDate,
    customRange,
  ]);
}
