import { AlertTriangle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useWasteInsight } from "../../hooks/useWasteInsight";
import { formatCurrency } from "../../lib/utils";

export default function WasteInsightCard() {
  const { trend, overspend, subscriptions } = useWasteInsight();

  const hasAnyInsight =
    (trend.hasEnoughData && trend.diff > 0) || overspend > 0 || subscriptions.length > 0;

  if (!hasAnyInsight) return null;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Insight Pemborosan</h3>
      </div>

      <div className="space-y-3">
        {trend.hasEnoughData && trend.diff > 0 && (
          <div className="rounded-xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              Pengeluaran non-esensial naik {formatCurrency(trend.diff)} dari rata-rata 3 bulan terakhir
            </p>
            <p className="text-xs font-light text-gray-500 dark:text-gray-400 mt-1">
              Bulan ini {formatCurrency(trend.currentNonEssential)} vs rata-rata {formatCurrency(trend.averageNonEssential)}
              {trend.topCategory && ` — terbesar di ${trend.topCategory.category} (${formatCurrency(trend.topCategory.amount)})`}
            </p>
          </div>
        )}

        {overspend > 0 && (
          <div className="rounded-xl bg-red-50/70 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              Total kelebihan budget bulan ini {formatCurrency(overspend)}
            </p>
            <p className="text-xs font-light text-gray-500 dark:text-gray-400 mt-1">
              Sejumlah ini yang harusnya bisa tertahan kalau pengeluaran sesuai budget.
            </p>
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2">
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              Langganan rutin sudah berjalan {">"}= 3 bulan — masih dipakai?
            </p>
            <div className="space-y-1.5">
              {subscriptions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="font-light text-gray-600 dark:text-gray-300">{s.name}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {formatCurrency(s.totalSpent)} total · {s.monthsActive}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
