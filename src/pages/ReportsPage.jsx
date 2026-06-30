import { useState } from "react";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { useReportData } from "../hooks/useReportData";
import { exportTransactionsToCsv, exportReportToCsv } from "../lib/excel";
import { downloadReportPdf } from "../lib/pdfReport";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate } from "../lib/utils";
import PeriodSwitcher from "../components/reports/PeriodSwitcher";
import ChartTypeToggle from "../components/reports/ChartTypeToggle";
import PieChartView from "../components/reports/PieChartView";
import BarChartView from "../components/reports/BarChartView";
import LineChartView from "../components/reports/LineChartView";
import DatePicker from "../components/ui/DatePicker";

const todayStr = () => new Date().toISOString().slice(0, 10);

const PERIOD_LABELS = { week: "Mingguan", month: "Bulanan", year: "Tahunan", custom: "Custom" };

export default function ReportsPage() {
  const { state } = useApp();
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("pie");
  const [customRange, setCustomRange] = useState({ from: todayStr(), to: todayStr() });

  const reportData = useReportData(period, new Date(), period === "custom" ? customRange : null);
  const { totalExpense, totalIncome, categoryTotals, series, fromLabel, toLabel } = reportData;

  const periodLabel =
    period === "custom"
      ? `${formatDate(fromLabel)} – ${formatDate(toLabel)}`
      : `${PERIOD_LABELS[period]} (${formatDate(fromLabel)} – ${formatDate(toLabel)})`;

  function handleDownloadPdf() {
    downloadReportPdf(reportData, periodLabel, `laporan-keuangan-${fromLabel}-${toLabel}.pdf`);
  }

  function handleDownloadCsv() {
    exportReportToCsv(reportData, periodLabel, `laporan-keuangan-${fromLabel}-${toLabel}.csv`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 print:hidden">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Laporan</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => exportTransactionsToCsv(reportData.periodTransactions)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
            title="Export transaksi mentah saja (tanpa ringkasan/alokasi/budget)"
          >
            <FileDown className="w-4 h-4" />
            Transaksi Saja
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 shadow-glow"
          >
            <Printer className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
        <PeriodSwitcher value={period} onChange={setPeriod} />
        <ChartTypeToggle value={chartType} onChange={setChartType} />
      </div>

      {period === "custom" && (
        <div className="flex flex-wrap items-end gap-3 mb-4 print:hidden">
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1.5">Dari</label>
            <DatePicker
              value={customRange.from}
              max={customRange.to}
              onChange={(value) => setCustomRange((r) => ({ ...r, from: value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-light text-gray-500 dark:text-gray-400 mb-1.5">Sampai</label>
            <DatePicker
              value={customRange.to}
              max={todayStr()}
              onChange={(value) => setCustomRange((r) => ({ ...r, to: value }))}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft">
          <p className="text-xs font-light text-gray-500 dark:text-gray-400">Total Pemasukan</p>
          <p className="text-lg font-semibold text-green-600 mt-0.5">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft">
          <p className="text-xs font-light text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
          <p className="text-lg font-semibold text-red-500 mt-0.5">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft mb-4">
        {chartType === "pie" && <PieChartView categoryTotals={categoryTotals} />}
        {chartType === "bar" && <BarChartView series={series} />}
        {chartType === "line" && <LineChartView series={series} />}
      </div>

      {reportData.budgetReport.length > 0 && (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Budget vs Realisasi</h3>
          <div className="space-y-2">
            {reportData.budgetReport.map((b) => (
              <div key={b.category} className="flex items-center justify-between text-sm">
                <span className="font-light text-gray-600 dark:text-gray-300">{b.category}</span>
                <span className={`font-medium ${b.isOverBudget ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                  {formatCurrency(b.spent)}
                  {b.limit !== null && ` / ${formatCurrency(b.limit)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportData.allocationByMonth.length > 0 && (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Alokasi Keuangan per Bulan</h3>
          <div className="space-y-3">
            {reportData.allocationByMonth.map((a, i) => (
              <div key={reportData.allocationMonthLabels[i]} className="text-sm">
                <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {reportData.allocationMonthLabels[i]}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="font-light text-gray-400">Dana Darurat</p>
                    <p className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(a.emergencyAllocated)}</p>
                  </div>
                  <div>
                    <p className="font-light text-gray-400">Investasi</p>
                    <p className="font-medium text-gray-700 dark:text-gray-200">{formatCurrency(a.investmentAllocated)}</p>
                  </div>
                  <div>
                    <p className="font-light text-gray-400">Sisa Biaya Hidup</p>
                    <p className={`font-medium ${a.realRemainingForLiving < 0 ? "text-red-500" : "text-gray-700 dark:text-gray-200"}`}>
                      {a.realRemainingForLiving < 0 && "-"}
                      {formatCurrency(Math.abs(a.realRemainingForLiving))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(reportData.savingsGoals.length > 0 || reportData.debts.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {reportData.savingsGoals.length > 0 && (
            <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Target Tabungan</h3>
              <div className="space-y-2">
                {reportData.savingsGoals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-sm">
                    <span className="font-light text-gray-600 dark:text-gray-300">{g.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reportData.debts.length > 0 && (
            <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Hutang</h3>
              <div className="space-y-2">
                {reportData.debts.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="font-light text-gray-600 dark:text-gray-300">{d.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(d.remainingAmount)} / {formatCurrency(d.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
