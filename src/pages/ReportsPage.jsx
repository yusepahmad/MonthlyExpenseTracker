import { useState } from "react";
import { Printer, FileDown } from "lucide-react";
import { useReportData } from "../hooks/useReportData";
import { exportTransactionsToCsv } from "../lib/excel";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../lib/utils";
import PeriodSwitcher from "../components/reports/PeriodSwitcher";
import ChartTypeToggle from "../components/reports/ChartTypeToggle";
import PieChartView from "../components/reports/PieChartView";
import BarChartView from "../components/reports/BarChartView";
import LineChartView from "../components/reports/LineChartView";

export default function ReportsPage() {
  const { state } = useApp();
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("pie");
  const { totalExpense, totalIncome, categoryTotals, series } = useReportData(period);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 print:hidden">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Laporan</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportTransactionsToCsv(state.transactions)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-light rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => window.print()}
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

      <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft">
        {chartType === "pie" && <PieChartView categoryTotals={categoryTotals} />}
        {chartType === "bar" && <BarChartView series={series} />}
        {chartType === "line" && <LineChartView series={series} />}
      </div>
    </div>
  );
}
