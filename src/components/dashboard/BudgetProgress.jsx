import { AlertTriangle, OctagonAlert } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useBudget } from "../../hooks/useBudget";
import { getCategory } from "../../lib/categories";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import AmountText from "../ui/AmountText";

export default function BudgetProgress({ hideAmount }) {
  const { state } = useApp();
  const budgets = useBudget().filter((b) => b.limit !== null);

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Budget Bulan Ini
      </h3>

      {budgets.length === 0 ? (
        <EmptyState message="Belum ada budget diset." iconName="Target" />
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const category = getCategory(b.category, state.customCategories);
            return (
              <div key={b.category}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5 font-light text-gray-600 dark:text-gray-300">
                    <Icon name={category?.icon} className="w-4 h-4" style={{ color: category?.color }} />
                    {b.category}
                  </span>
                  <span className={`font-medium ${b.isOverBudget ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
                    <AmountText amount={b.spent} hide={hideAmount} /> / <AmountText amount={b.limit} hide={hideAmount} />
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      b.isOverBudget
                        ? "bg-gradient-to-r from-red-500 to-rose-400"
                        : b.alertLevel === "warning"
                        ? "bg-gradient-to-r from-amber-500 to-orange-400"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>

                {b.alertLevel === "exceeded" && (
                  <p className="flex items-center gap-1.5 text-xs font-light text-red-500 mt-1.5">
                    <OctagonAlert className="w-3.5 h-3.5 shrink-0" />
                    Budget {b.category} telah terlampaui
                  </p>
                )}
                {b.alertLevel === "warning" && (
                  <p className="flex items-center gap-1.5 text-xs font-light text-amber-600 dark:text-amber-400 mt-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Budget {b.category} sudah mencapai {Math.round(b.rawPercentage)}%
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
