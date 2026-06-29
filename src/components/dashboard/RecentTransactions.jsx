import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import { formatDate } from "../../lib/utils";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import AmountText from "../ui/AmountText";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function RecentTransactions({ hideAmount, categoryFilter = "all" }) {
  const { state, dispatch } = useApp();
  const [pendingDelete, setPendingDelete] = useState(null);

  const recent = useMemo(() => {
    return state.transactions
      .filter((t) => t.date.startsWith(state.activeMonth))
      .filter((t) => categoryFilter === "all" || t.category === categoryFilter)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [state.transactions, state.activeMonth, categoryFilter]);

  function handleDelete() {
    dispatch({ type: "DELETE_TRANSACTION", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft animate-fade-in">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Transaksi Terakhir
      </h3>

      {recent.length === 0 ? (
        <EmptyState
          message={categoryFilter === "all" ? "Belum ada transaksi." : "Tidak ada transaksi untuk kategori ini."}
          iconName="Wallet"
        />
      ) : (
        <div className="space-y-3">
          {recent.map((t) => {
            const category = getCategory(t.category, state.customCategories);
            return (
              <div key={t.id} className="flex items-center gap-3 transition-transform duration-200 hover:translate-x-0.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/40"
                  style={{
                    background: `linear-gradient(135deg, ${category?.color}33, ${category?.color}11)`,
                  }}
                >
                  <Icon name={category?.icon} className="w-5 h-5" style={{ color: category?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {t.description || t.category}
                  </p>
                  <p className="text-xs font-light text-gray-400">{formatDate(t.date)}</p>
                </div>
                <span
                  className={`text-sm font-medium shrink-0 ${
                    t.type === "income" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <AmountText
                    amount={t.amount}
                    hide={hideAmount}
                    prefix={t.type === "income" ? "+" : "-"}
                  />
                </span>
                <button
                  onClick={() => setPendingDelete(t)}
                  className="text-gray-300 hover:text-red-500 hover:scale-125 transition-transform shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus transaksi?"
        message={pendingDelete ? `"${pendingDelete.description || pendingDelete.category}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
