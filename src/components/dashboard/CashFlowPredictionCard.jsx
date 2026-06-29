import { TrendingDown, TrendingUp, Gauge } from "lucide-react";
import { useCashFlowPrediction } from "../../hooks/useCashFlowPrediction";
import { formatCurrency } from "../../lib/utils";
import AmountText from "../ui/AmountText";

export default function CashFlowPredictionCard({ hideAmount }) {
  const { balance, netBurnPerDay, daysUntilZero, isPositiveTrend, hasEnoughData } = useCashFlowPrediction();

  if (!hasEnoughData) return null;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-1.5 mb-3">
        <Gauge className="w-3.5 h-3.5 text-purple-500" />
        <span className="text-xs font-light text-gray-500 dark:text-gray-400">Prediksi Cash Flow</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-light text-gray-600 dark:text-gray-300">Saldo Keseluruhan</span>
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          <AmountText amount={balance} hide={hideAmount} />
        </span>
      </div>

      {isPositiveTrend ? (
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
          <p className="font-light text-gray-600 dark:text-gray-300">
            Pengeluaran lebih kecil dari pemasukan rata-rata 30 hari terakhir.{" "}
            <span className="font-medium text-green-600">Tren keuangan positif.</span>
          </p>
        </div>
      ) : daysUntilZero !== null ? (
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />
          <p className="font-light text-gray-600 dark:text-gray-300">
            Dengan rata-rata pengeluaran bersih{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(netBurnPerDay)}/hari
            </span>
            , saldo diperkirakan habis dalam{" "}
            <span className="font-medium text-red-500">{daysUntilZero} hari</span>.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <TrendingDown className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="font-light text-gray-600 dark:text-gray-300">
            Saldo sudah negatif atau habis — segera tinjau pengeluaran Anda.
          </p>
        </div>
      )}
    </div>
  );
}
