import { TrendingDown, TrendingUp } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useInsights } from "../../hooks/useInsights";
import { getCategory } from "../../lib/categories";
import { formatDate } from "../../lib/utils";
import Icon from "../ui/Icon";
import AmountText from "../ui/AmountText";

function BiggestCard({ label, transaction, accentIcon, accentClass, hideAmount }) {
  const { state } = useApp();
  const category = transaction ? getCategory(transaction.category, state.customCategories) : null;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in flex-1">
      <div className="flex items-center gap-1.5 mb-2">
        {accentIcon}
        <span className="text-xs font-light text-gray-500 dark:text-gray-400">{label}</span>
      </div>

      {!transaction ? (
        <p className="text-sm font-light text-gray-400">Belum ada data.</p>
      ) : (
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${category?.color}22` }}
          >
            <Icon name={category?.icon} className="w-4 h-4" style={{ color: category?.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {transaction.description || transaction.category}
            </p>
            <p className="text-xs font-light text-gray-400">{formatDate(transaction.date)}</p>
          </div>
          <span className={`text-sm font-semibold shrink-0 ${accentClass}`}>
            <AmountText amount={transaction.amount} hide={hideAmount} />
          </span>
        </div>
      )}
    </div>
  );
}

export default function InsightCards({ hideAmount }) {
  const { biggestExpense, biggestIncome } = useInsights();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <BiggestCard
        label="Pengeluaran Terbesar"
        transaction={biggestExpense}
        accentIcon={<TrendingDown className="w-3.5 h-3.5 text-red-500" />}
        accentClass="text-red-500"
        hideAmount={hideAmount}
      />
      <BiggestCard
        label="Pendapatan Terbesar"
        transaction={biggestIncome}
        accentIcon={<TrendingUp className="w-3.5 h-3.5 text-green-600" />}
        accentClass="text-green-600"
        hideAmount={hideAmount}
      />
    </div>
  );
}
