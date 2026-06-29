import { Sparkles, X } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

export default function SuggestionChip({ transaction, onAccept, onDismiss }) {
  if (!transaction) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/70 dark:bg-purple-900/20 border border-purple-200/60 dark:border-purple-800/40 animate-fade-in">
      <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
      <button
        type="button"
        onClick={onAccept}
        className="flex-1 text-left text-sm font-light text-purple-700 dark:text-purple-300 hover:underline"
      >
        {transaction.description || transaction.category} seperti{" "}
        {transaction.date === new Date().toISOString().slice(0, 10) ? "ini" : "sebelumnya"}?{" "}
        <span className="font-medium">({formatCurrency(transaction.amount)})</span>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-purple-400 hover:text-purple-600 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
