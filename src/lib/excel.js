import * as XLSX from "xlsx";
import { excludeTransfers } from "./utils";

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

function normalizeCategories(rows) {
  return rows
    .filter((r) => r.name)
    .map((r) => ({
      name: r.name,
      type: r.type || "expense",
      color: r.color || "#6B7280",
      icon: r.icon || "Tag",
      subcategories: r.subcategories ? String(r.subcategories).split(",").map((s) => s.trim()).filter(Boolean) : [],
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
  appendSheet(wb, SHEET_NAMES.SUMMARY, [
    { month: "", total_expense: "", total_income: "", net: "", by_category: "" },
  ]);
  return wb;
}
