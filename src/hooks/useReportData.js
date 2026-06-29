import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { startOfWeek, toDateStr } from "../lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function filterByPeriod(transactions, period, referenceDate) {
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

export function useReportData(period, referenceDate = new Date()) {
  const { state } = useApp();

  return useMemo(() => {
    const periodTransactions = filterByPeriod(state.transactions, period, referenceDate);

    const totalExpense = periodTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalIncome = periodTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);

    const categoryTotals = buildCategoryTotals(periodTransactions);

    let series;
    if (period === "week") {
      series = buildDailySeries(state.transactions, referenceDate);
    } else if (period === "year") {
      series = buildMonthlySeries(state.transactions, referenceDate.getFullYear());
    } else {
      series = buildDailyOfMonthSeries(state.transactions, referenceDate);
    }

    return { totalExpense, totalIncome, categoryTotals, series };
  }, [state.transactions, period, referenceDate]);
}
