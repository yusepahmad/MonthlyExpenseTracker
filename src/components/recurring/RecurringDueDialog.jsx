import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import { formatCurrency, generateId } from "../../lib/utils";
import { buildTransactionFromRecurring } from "../../lib/recurring";
import Icon from "../ui/Icon";

export default function RecurringDueDialog({ dueItems, onClose }) {
  const { state, dispatch } = useApp();

  if (dueItems.length === 0) return null;

  function confirmAll() {
    dueItems.forEach((recurring) => {
      const transaction = buildTransactionFromRecurring(recurring);
      dispatch({ type: "ADD_TRANSACTION", payload: { ...transaction, id: generateId() } });
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/70 dark:border-gray-700/70 p-5 shadow-card animate-scale-in">
        <h3 className="font-display text-base font-medium text-gray-900 dark:text-white mb-1.5">
          Recurring jatuh tempo
        </h3>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400 mb-4">
          Ada {dueItems.length} transaksi rutin yang belum dicatat bulan ini. Tambahkan sekarang?
        </p>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {dueItems.map((r) => {
            const category = getCategory(r.category, state.customCategories);
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category?.color}22` }}
                >
                  <Icon name={category?.icon} className="w-4 h-4" style={{ color: category?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
                  <p className="text-xs font-light text-gray-400">{formatCurrency(r.amount)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            Nanti saja
          </button>
          <button
            onClick={confirmAll}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
          >
            Tambahkan Semua
          </button>
        </div>
      </div>
    </div>
  );
}
