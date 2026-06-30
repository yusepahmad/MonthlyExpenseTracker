import { HeartPulse } from "lucide-react";
import { useFinancialHealthScore } from "../../hooks/useFinancialHealthScore";

const FACTOR_LABELS = {
  savingsRate: "Rasio Tabungan",
  budgetAdherence: "Kepatuhan Budget",
  cashflowTrend: "Tren Arus Kas",
  spendingStability: "Stabilitas Pengeluaran",
  debtRatio: "Rasio Hutang",
};

function scoreColor(score) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreBarClass(score) {
  if (score >= 80) return "bg-gradient-to-r from-green-500 to-emerald-400";
  if (score >= 60) return "bg-gradient-to-r from-amber-500 to-orange-400";
  return "bg-gradient-to-r from-red-500 to-rose-400";
}

export default function HealthScoreCard() {
  const { score, factors } = useFinancialHealthScore();

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <HeartPulse className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Financial Health Score</h3>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className={`font-display text-4xl font-medium ${scoreColor(score)}`}>{score}</span>
        <span className="text-sm font-light text-gray-400 mb-1">/ 100</span>
      </div>

      <div className="space-y-3">
        {Object.entries(factors).map(([key, factor]) => {
          const pct = Math.round((factor.points / 20) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-light text-gray-600 dark:text-gray-300">{FACTOR_LABELS[key]}</span>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {factor.hasData ? `${pct}%` : "Data belum cukup"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${scoreBarClass(pct)}`}
                  style={{ width: `${factor.hasData ? pct : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-light text-gray-400 mt-4">
        Skor dihitung dari 5 faktor di atas, dibobot rata. Faktor dengan data belum cukup diberi nilai netral.
      </p>
    </div>
  );
}
