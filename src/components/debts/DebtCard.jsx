import { CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import RowMenu from "../ui/RowMenu";

export default function DebtCard({ debt, onEdit, onDelete }) {
  const paidAmount = debt.totalAmount - debt.remainingAmount;
  const percentage = debt.totalAmount > 0 ? Math.min((paidAmount / debt.totalAmount) * 100, 100) : 0;
  const isPaidOff = debt.remainingAmount <= 0;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isPaidOff ? "bg-green-500/20" : "bg-red-500/20"
          }`}
        >
          <CreditCard className={`w-5 h-5 ${isPaidOff ? "text-green-600" : "text-red-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{debt.name}</p>
          {debt.dueDate && (
            <p className="text-xs font-light text-gray-400">Jatuh tempo: {formatDate(debt.dueDate)}</p>
          )}
        </div>
        <RowMenu onEdit={() => onEdit(debt)} onDelete={() => onDelete(debt)} />
      </div>

      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-light text-gray-600 dark:text-gray-300">
          Sisa {formatCurrency(debt.remainingAmount)} / {formatCurrency(debt.totalAmount)}
        </span>
        <span className={`font-medium ${isPaidOff ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isPaidOff
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : "bg-gradient-to-r from-red-500 to-rose-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isPaidOff && <p className="text-xs font-light text-green-600 mt-1.5">Lunas!</p>}
    </div>
  );
}
