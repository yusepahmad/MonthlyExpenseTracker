import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import { useInsights } from "../../hooks/useInsights";
import { formatCurrency } from "../../lib/utils";

export default function InsightMessages() {
  const { trends } = useInsights();

  if (trends.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
        <span className="text-xs font-light text-gray-500 dark:text-gray-400">
          Insight Bulan Ini
        </span>
      </div>

      <div className="space-y-2">
        {trends.slice(0, 4).map((t) => {
          const isUp = t.diff > 0;
          return (
            <div key={t.category} className="flex items-center gap-2 text-sm">
              {isUp ? (
                <ArrowUp className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <ArrowDown className="w-4 h-4 text-green-600 shrink-0" />
              )}
              <p className="font-light text-gray-600 dark:text-gray-300">
                <span className="font-medium text-gray-900 dark:text-white">{t.category}</span>{" "}
                {isUp ? "naik" : "turun"}{" "}
                {t.previous > 0 ? (
                  <span className={isUp ? "text-red-500" : "text-green-600"}>
                    {Math.abs(t.percentChange).toFixed(0)}%
                  </span>
                ) : (
                  <span className={isUp ? "text-red-500" : "text-green-600"}>
                    {formatCurrency(Math.abs(t.diff))}
                  </span>
                )}{" "}
                dibanding bulan lalu
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
