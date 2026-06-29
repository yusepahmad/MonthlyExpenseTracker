import { PiggyBank } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import RowMenu from "../ui/RowMenu";

export default function SavingsGoalCard({ goal, onEdit, onDelete }) {
  const percentage = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
  const isComplete = goal.currentAmount >= goal.targetAmount;

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-4 shadow-soft animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isComplete ? "bg-green-500/20" : "bg-indigo-500/20"
          }`}
        >
          <PiggyBank className={`w-5 h-5 ${isComplete ? "text-green-600" : "text-indigo-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{goal.name}</p>
          {goal.deadline && (
            <p className="text-xs font-light text-gray-400">Target: {formatDate(goal.deadline)}</p>
          )}
        </div>
        <RowMenu onEdit={() => onEdit(goal)} onDelete={() => onDelete(goal)} />
      </div>

      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-light text-gray-600 dark:text-gray-300">
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
        <span className={`font-medium ${isComplete ? "text-green-600" : "text-gray-900 dark:text-white"}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isComplete
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : "bg-gradient-to-r from-indigo-500 to-purple-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isComplete && (
        <p className="text-xs font-light text-green-600 mt-1.5">🎉 Target tercapai!</p>
      )}
    </div>
  );
}
