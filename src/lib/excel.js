import * as XLSX from "xlsx";
import { excludeTransfers, formatCurrency, formatDate } from "./utils";

const SHEET_NAMES = {
  TRANSAKSI: "Transaksi",
  BUDGET: "Budget",
  RECURRING: "Recurring",
  SUMMARY: "Summary",
  CATEGORIES: "Categories",
  SAVINGS_GOALS: "SavingsGoals",
  WISHLIST: "Wishlist",
  ACCOUNTS: "Accounts",
  CHALLENGES: "Challenges",
  DEBTS: "Debts",
  ALLOCATION_SETTINGS: "AllocationSettings",
};

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        resolve({
          transactions: normalizeTransactions(sheetToJson(wb, SHEET_NAMES.TRANSAKSI)),
          budgets: sheetToJson(wb, SHEET_NAMES.BUDGET),
          recurring: normalizeRecurring(sheetToJson(wb, SHEET_NAMES.RECURRING)),
          customCategories: normalizeCategories(sheetToJson(wb, SHEET_NAMES.CATEGORIES)),
          savingsGoals: normalizeSavingsGoals(sheetToJson(wb, SHEET_NAMES.SAVINGS_GOALS)),
          wishlist: normalizeWishlist(sheetToJson(wb, SHEET_NAMES.WISHLIST)),
          accounts: normalizeAccounts(sheetToJson(wb, SHEET_NAMES.ACCOUNTS)),
          challenges: normalizeChallenges(sheetToJson(wb, SHEET_NAMES.CHALLENGES)),
          debts: normalizeDebts(sheetToJson(wb, SHEET_NAMES.DEBTS)),
          allocationSettings: normalizeAllocationSettings(sheetToJson(wb, SHEET_NAMES.ALLOCATION_SETTINGS)),
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function sheetToJson(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws);
}

function normalizeTransactions(rows) {
  return rows.map((r) => ({
    ...r,
    subcategory: r.subcategory || "",
    amount: Number(r.amount) || 0,
    is_recurring: r.is_recurring === true || r.is_recurring === "true",
    // Old exports (pre-Phase 9) have no account column at all.
    account: r.account || "acc_cash",
    transfer_id: r.transfer_id || null,
    allocationTag: r.allocationTag || null,
  }));
}

function normalizeRecurring(rows) {
  return rows.map((r) => ({
    ...r,
    amount: Number(r.amount) || 0,
    day_of_month: Number(r.day_of_month) || 1,
    is_active: r.is_active === true || r.is_active === "true",
  }));
}

function normalizeSavingsGoals(rows) {
  return rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      targetAmount: Number(r.targetAmount) || 0,
      currentAmount: Number(r.currentAmount) || 0,
      deadline: r.deadline || "",
    }));
}

function normalizeWishlist(rows) {
  return rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      price: Number(r.price) || 0,
      priority: r.priority || "medium",
    }));
}

function normalizeAccounts(rows) {
  return rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      isDefault: r.isDefault === true || r.isDefault === "true",
    }));
}

function normalizeChallenges(rows) {
  return rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      type: r.type,
      category: r.category,
      targetAmount: r.targetAmount !== undefined && r.targetAmount !== "" ? Number(r.targetAmount) : null,
      startDate: r.startDate,
      endDate: r.endDate,
    }));
}

function normalizeDebts(rows) {
  return rows
    .filter((r) => r.id)
    .map((r) => ({
      id: r.id,
      name: r.name,
      totalAmount: Number(r.totalAmount) || 0,
      remainingAmount: Number(r.remainingAmount) || 0,
      dueDate: r.dueDate || "",
    }));
}

function normalizeAllocationSettings(rows) {
  const row = rows[0];
  if (!row) return null;
  return {
    emergencyPercent: Number(row.emergencyPercent) || 20,
    investmentPercent: Number(row.investmentPercent) || 10,
    livingPercent: Number(row.livingPercent) || 70,
  };
}

function normalizeCategories(rows) {
  return rows
    .filter((r) => r.name)
    .map((r) => ({
      name: r.name,
      type: r.type || "expense",
      color: r.color || "#6B7280",
      icon: r.icon || "Tag",
      subcategories: r.subcategories ? String(r.subcategories).split(",").map((s) => s.trim()).filter(Boolean) : [],
      ...((r.type || "expense") === "expense"
        ? {
            isEssential: r.isEssential === true || r.isEssential === "true" || r.isEssential === undefined,
            allocationPocket: r.allocationPocket || "living",
          }
        : {}),
    }));
}

export function exportToExcel(state, fileName = "pengeluaran.xlsx") {
  const wb = XLSX.utils.book_new();

  appendSheet(wb, SHEET_NAMES.TRANSAKSI, state.transactions);
  appendSheet(wb, SHEET_NAMES.BUDGET, state.budgets);
  appendSheet(wb, SHEET_NAMES.RECURRING, state.recurring);
  appendSheet(wb, SHEET_NAMES.CATEGORIES, serializeCategories(state.customCategories));
  appendSheet(wb, SHEET_NAMES.SAVINGS_GOALS, state.savingsGoals);
  appendSheet(wb, SHEET_NAMES.WISHLIST, state.wishlist);
  appendSheet(wb, SHEET_NAMES.ACCOUNTS, state.accounts);
  appendSheet(wb, SHEET_NAMES.CHALLENGES, state.challenges);
  appendSheet(wb, SHEET_NAMES.DEBTS, state.debts);
  appendSheet(wb, SHEET_NAMES.ALLOCATION_SETTINGS, [state.allocationSettings]);
  appendSheet(wb, SHEET_NAMES.SUMMARY, buildSummary(state.transactions));

  XLSX.writeFile(wb, fileName);
}

function serializeCategories(customCategories) {
  return (customCategories || []).map((c) => ({
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
    subcategories: (c.subcategories || []).join(", "),
    ...(c.type === "expense"
      ? { isEssential: c.isEssential ?? true, allocationPocket: c.allocationPocket || "living" }
      : {}),
  }));
}

function appendSheet(wb, name, data) {
  const ws = XLSX.utils.json_to_sheet(data && data.length ? data : [{}]);
  autoFitColumns(ws, data);
  XLSX.utils.book_append_sheet(wb, ws, name);
}

function autoFitColumns(ws, data) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  ws["!cols"] = headers.map((h) => {
    const maxLen = Math.max(
      h.length,
      ...data.map((row) => String(row[h] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
}

export function buildSummary(transactions) {
  const byMonth = {};

  excludeTransfers(transactions).forEach((t) => {
    const month = t.date?.slice(0, 7);
    if (!month) return;
    if (!byMonth[month]) {
      byMonth[month] = { total_expense: 0, total_income: 0, by_category: {} };
    }
    const amount = Number(t.amount) || 0;
    if (t.type === "income") {
      byMonth[month].total_income += amount;
    } else {
      byMonth[month].total_expense += amount;
      byMonth[month].by_category[t.category] =
        (byMonth[month].by_category[t.category] || 0) + amount;
    }
  });

  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      total_expense: data.total_expense,
      total_income: data.total_income,
      net: data.total_income - data.total_expense,
      by_category: JSON.stringify(data.by_category),
    }));
}

export function exportTransactionsToCsv(transactions, fileName = "transaksi.csv") {
  const ws = XLSX.utils.json_to_sheet(transactions && transactions.length ? transactions : [{}]);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

// Builds one multi-section CSV mirroring the PDF report (summary, category
// breakdown, allocation, budget, savings, debts, full transaction list) —
// every row tagged with which section it belongs to in the first column,
// so the whole thing stays a single importable/analyzable file instead of
// scattering the data across several exports.
function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function csvRow(cells) {
  return cells.map(csvEscape).join(",");
}

export function exportReportToCsv(reportData, periodLabel, fileName = "laporan-keuangan.csv") {
  const lines = [];

  lines.push(csvRow(["Laporan Keuangan"]));
  lines.push(csvRow(["Periode", periodLabel]));
  lines.push(csvRow(["Dibuat", formatDate(new Date().toISOString().slice(0, 10))]));
  lines.push("");

  lines.push(csvRow(["RINGKASAN"]));
  lines.push(csvRow(["Total Pemasukan", "Total Pengeluaran", "Saldo Bersih"]));
  lines.push(
    csvRow([
      formatCurrency(reportData.totalIncome),
      formatCurrency(reportData.totalExpense),
      formatCurrency(reportData.totalIncome - reportData.totalExpense),
    ])
  );
  lines.push("");

  if (reportData.categoryTotals.length > 0) {
    lines.push(csvRow(["PENGELUARAN PER KATEGORI"]));
    lines.push(csvRow(["Kategori", "Total", "% dari Total Pengeluaran"]));
    reportData.categoryTotals.forEach((c) => {
      const pct = reportData.totalExpense > 0 ? ((c.value / reportData.totalExpense) * 100).toFixed(1) : "0";
      lines.push(csvRow([c.category, formatCurrency(c.value), `${pct}%`]));
    });
    lines.push("");
  }

  if (reportData.allocationByMonth.length > 0) {
    lines.push(csvRow(["ALOKASI KEUANGAN (DANA DARURAT / INVESTASI / BIAYA HIDUP)"]));
    lines.push(csvRow(["Bulan", "Pemasukan", "Dana Darurat Teralokasi", "Dana Darurat Target", "Investasi Teralokasi", "Investasi Target", "Sisa Riil Biaya Hidup"]));
    reportData.allocationByMonth.forEach((a, i) => {
      lines.push(
        csvRow([
          reportData.allocationMonthLabels[i] || "-",
          formatCurrency(a.monthIncome),
          formatCurrency(a.emergencyAllocated),
          formatCurrency(a.emergencyTarget),
          formatCurrency(a.investmentAllocated),
          formatCurrency(a.investmentTarget),
          a.realRemainingForLiving < 0
            ? `-${formatCurrency(Math.abs(a.realRemainingForLiving))}`
            : formatCurrency(a.realRemainingForLiving),
        ])
      );
    });
    lines.push("");
  }

  if (reportData.budgetReport.length > 0) {
    lines.push(csvRow(["BUDGET VS REALISASI"]));
    lines.push(csvRow(["Kategori", "Realisasi", "Budget", "Status"]));
    reportData.budgetReport.forEach((b) => {
      lines.push(
        csvRow([
          b.category,
          formatCurrency(b.spent),
          b.limit !== null ? formatCurrency(b.limit) : "-",
          b.limit === null ? "Tanpa budget" : b.isOverBudget ? "Melebihi budget" : "Sesuai budget",
        ])
      );
    });
    lines.push("");
  }

  if (reportData.savingsGoals.length > 0) {
    lines.push(csvRow(["TARGET TABUNGAN (SNAPSHOT SAAT INI)"]));
    lines.push(csvRow(["Nama", "Terkumpul", "Target", "Progress"]));
    reportData.savingsGoals.forEach((g) => {
      const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      lines.push(csvRow([g.name, formatCurrency(g.currentAmount), formatCurrency(g.targetAmount), `${pct}%`]));
    });
    lines.push("");
  }

  if (reportData.debts.length > 0) {
    lines.push(csvRow(["HUTANG (SNAPSHOT SAAT INI)"]));
    lines.push(csvRow(["Nama", "Sisa", "Total", "Lunas"]));
    reportData.debts.forEach((d) => {
      const paidPct = d.totalAmount > 0 ? Math.round(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100) : 0;
      lines.push(csvRow([d.name, formatCurrency(d.remainingAmount), formatCurrency(d.totalAmount), d.remainingAmount <= 0 ? "Ya" : `${paidPct}%`]));
    });
    lines.push("");
  }

  if (reportData.periodTransactions.length > 0) {
    lines.push(csvRow(["DAFTAR TRANSAKSI"]));
    lines.push(csvRow(["Tanggal", "Kategori", "Sub-kategori", "Deskripsi", "Tipe", "Nominal"]));
    [...reportData.periodTransactions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((t) => {
        lines.push(
          csvRow([
            formatDate(t.date),
            t.category,
            t.subcategory || "-",
            t.description || "-",
            t.type === "income" ? "Pemasukan" : "Pengeluaran",
            `${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}`,
          ])
        );
      });
  }

  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function generateTemplateWorkbook() {
  const wb = XLSX.utils.book_new();
  appendSheet(wb, SHEET_NAMES.TRANSAKSI, [
    {
      id: "txn_1718000000",
      date: "2025-06-15",
      category: "Makan",
      subcategory: "Warung",
      amount: 45000,
      type: "expense",
      description: "Ayam geprek",
      is_recurring: false,
      recurring_id: "",
      account: "acc_cash",
      transfer_id: "",
    },
  ]);
  appendSheet(wb, SHEET_NAMES.BUDGET, [
    { month: "2025-06", category: "Makan", budget_amount: 800000 },
  ]);
  appendSheet(wb, SHEET_NAMES.RECURRING, [
    {
      id: "rec_001",
      name: "Spotify",
      category: "Hiburan",
      amount: 54990,
      frequency: "monthly",
      day_of_month: 1,
      is_active: true,
    },
  ]);
  appendSheet(wb, SHEET_NAMES.CATEGORIES, [
    { name: "Piket Tambahan", type: "income", color: "#0EA5E9", icon: "Tag", subcategories: "" },
  ]);
  appendSheet(wb, SHEET_NAMES.SAVINGS_GOALS, [
    { id: "goal_001", name: "Laptop", targetAmount: 15000000, currentAmount: 9000000, deadline: "2025-12-31" },
  ]);
  appendSheet(wb, SHEET_NAMES.WISHLIST, [
    { id: "wish_001", name: "Headphone", price: 1200000, priority: "medium" },
  ]);
  appendSheet(wb, SHEET_NAMES.ACCOUNTS, [
    { id: "acc_cash", name: "Cash", isDefault: true },
  ]);
  appendSheet(wb, SHEET_NAMES.CHALLENGES, [
    {
      id: "chal_001",
      type: "no_spend",
      category: "Hiburan",
      targetAmount: "",
      startDate: "2025-06-01",
      endDate: "2025-06-07",
    },
  ]);
  appendSheet(wb, SHEET_NAMES.DEBTS, [
    { id: "debt_001", name: "Cicilan Motor", totalAmount: 20000000, remainingAmount: 12000000, dueDate: "2026-12-31" },
  ]);
  appendSheet(wb, SHEET_NAMES.ALLOCATION_SETTINGS, [
    { emergencyPercent: 20, investmentPercent: 10, livingPercent: 70 },
  ]);
  appendSheet(wb, SHEET_NAMES.SUMMARY, [
    { month: "", total_expense: "", total_income: "", net: "", by_category: "" },
  ]);
  return wb;
}
