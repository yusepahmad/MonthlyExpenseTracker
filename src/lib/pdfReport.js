import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "./utils";

const PAGE_MARGIN = 14;
const ACCENT_COLOR = [99, 102, 241]; // indigo-500, matches the app's gradient theme

function addSectionTitle(doc, title, y) {
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...ACCENT_COLOR);
  doc.text(title, PAGE_MARGIN, y);
  doc.setTextColor(20, 20, 20);
  doc.setFont(undefined, "normal");
  return y + 6;
}

function ensureSpace(doc, y, needed) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 15) {
    doc.addPage();
    return 20;
  }
  return y;
}

// Builds a full, print-ready financial report — not just a screenshot of
// the charts, but every section the user asked to be able to analyze:
// summary, category breakdown, allocation (20/10/70), budget vs actual,
// savings goals, debts, and the complete transaction list for the period.
export function generateReportPdf(reportData, periodLabel) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;

  // --- Header ---
  doc.setFontSize(18);
  doc.setFont(undefined, "bold");
  doc.text("Laporan Keuangan Bulanan", PAGE_MARGIN, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Periode: ${periodLabel}`, PAGE_MARGIN, y);
  y += 5;
  doc.text(`Dibuat: ${formatDate(new Date().toISOString().slice(0, 10))}`, PAGE_MARGIN, y);
  doc.setTextColor(20, 20, 20);
  y += 10;

  // --- Summary ---
  y = addSectionTitle(doc, "Ringkasan", y);
  const net = reportData.totalIncome - reportData.totalExpense;
  autoTable(doc, {
    startY: y,
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    head: [["Total Pemasukan", "Total Pengeluaran", "Saldo Bersih"]],
    body: [[formatCurrency(reportData.totalIncome), formatCurrency(reportData.totalExpense), formatCurrency(net)]],
    theme: "grid",
    headStyles: { fillColor: ACCENT_COLOR },
    styles: { fontSize: 9 },
  });
  y = doc.lastAutoTable.finalY + 10;

  // --- Category breakdown ---
  if (reportData.categoryTotals.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Pengeluaran per Kategori", y);
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Kategori", "Total", "% dari Total Pengeluaran"]],
      body: reportData.categoryTotals.map((c) => [
        c.category,
        formatCurrency(c.value),
        reportData.totalExpense > 0 ? `${((c.value / reportData.totalExpense) * 100).toFixed(1)}%` : "0%",
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 8.5 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Allocation (20/10/70) — one snapshot per month in range ---
  if (reportData.allocationByMonth.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Alokasi Keuangan (Dana Darurat / Investasi / Biaya Hidup)", y);
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Bulan", "Pemasukan", "Dana Darurat", "Investasi", "Biaya Hidup (Sisa Riil)"]],
      body: reportData.allocationByMonth.map((a, i) => [
        reportData.allocationMonthLabels?.[i] || "-",
        formatCurrency(a.monthIncome),
        `${formatCurrency(a.emergencyAllocated)} / ${formatCurrency(a.emergencyTarget)}`,
        `${formatCurrency(a.investmentAllocated)} / ${formatCurrency(a.investmentTarget)}`,
        a.realRemainingForLiving < 0
          ? `-${formatCurrency(Math.abs(a.realRemainingForLiving))} (minus)`
          : formatCurrency(a.realRemainingForLiving),
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 7.5 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Budget vs actual ---
  if (reportData.budgetReport.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Budget vs Realisasi", y);
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Kategori", "Realisasi", "Budget", "Status"]],
      body: reportData.budgetReport.map((b) => [
        b.category,
        formatCurrency(b.spent),
        b.limit !== null ? formatCurrency(b.limit) : "-",
        b.limit === null ? "Tanpa budget" : b.isOverBudget ? "Melebihi budget" : "Sesuai budget",
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 8.5 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 3 && data.cell.raw === "Melebihi budget") {
          data.cell.styles.textColor = [220, 38, 38];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Savings goals snapshot ---
  if (reportData.savingsGoals.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Target Tabungan (Snapshot Saat Ini)", y);
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Nama", "Terkumpul", "Target", "Progress"]],
      body: reportData.savingsGoals.map((g) => [
        g.name,
        formatCurrency(g.currentAmount),
        formatCurrency(g.targetAmount),
        g.targetAmount > 0 ? `${Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))}%` : "0%",
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 8.5 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Debts snapshot ---
  if (reportData.debts.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Hutang (Snapshot Saat Ini)", y);
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Nama", "Sisa", "Total", "Lunas"]],
      body: reportData.debts.map((d) => [
        d.name,
        formatCurrency(d.remainingAmount),
        formatCurrency(d.totalAmount),
        d.remainingAmount <= 0 ? "Ya" : `${Math.round(((d.totalAmount - d.remainingAmount) / d.totalAmount) * 100)}%`,
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 8.5 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- Full transaction list ---
  if (reportData.periodTransactions.length > 0) {
    y = ensureSpace(doc, y, 20);
    y = addSectionTitle(doc, "Daftar Transaksi", y);
    const sorted = [...reportData.periodTransactions].sort((a, b) => a.date.localeCompare(b.date));
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      head: [["Tanggal", "Kategori", "Deskripsi", "Tipe", "Nominal"]],
      body: sorted.map((t) => [
        formatDate(t.date),
        t.category,
        t.description || "-",
        t.type === "income" ? "Pemasukan" : "Pengeluaran",
        `${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: ACCENT_COLOR },
      styles: { fontSize: 7.5 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          data.cell.styles.textColor = String(data.cell.raw).startsWith("+") ? [22, 163, 74] : [220, 38, 38];
        }
      },
    });
  }

  // --- Page numbers footer ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  return doc;
}

export function downloadReportPdf(reportData, periodLabel, fileName = "laporan-keuangan.pdf") {
  const doc = generateReportPdf(reportData, periodLabel);
  doc.save(fileName);
}
