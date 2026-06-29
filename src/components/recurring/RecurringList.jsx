import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import { formatCurrency } from "../../lib/utils";
import { daysUntilNextBilling } from "../../lib/recurring";
import Icon from "../ui/Icon";
import RowMenu from "../ui/RowMenu";
import ConfirmDialog from "../ui/ConfirmDialog";
import EmptyState from "../ui/EmptyState";

export default function RecurringList({ onEdit }) {
  const { state, dispatch } = useApp();
  const [pendingDelete, setPendingDelete] = useState(null);

  function handleDelete() {
    dispatch({ type: "DELETE_RECURRING", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  if (state.recurring.length === 0) {
    return (
      <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft animate-fade-in">
        <EmptyState message="Belum ada recurring transaction." iconName="Repeat" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft divide-y divide-white/40 dark:divide-gray-800/60 animate-fade-in">
      {state.recurring.map((r) => {
        const category = getCategory(r.category, state.customCategories);
        const daysLeft = daysUntilNextBilling(r);
        return (
          <div key={r.id} className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/40"
              style={{ backgroundColor: `${category?.color}22` }}
            >
              <Icon name={category?.icon} className="w-5 h-5" style={{ color: category?.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
                {!r.is_active && (
                  <span className="text-[10px] font-light px-1.5 py-0.5 rounded-full bg-gray-200/60 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400">
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-xs font-light text-gray-400 mt-0.5">
                {r.category} · Tagihan berikutnya{" "}
                {daysLeft === 0 ? "hari ini" : `dalam ${daysLeft} hari`}
              </p>
            </div>

            <span className="text-sm font-medium text-gray-900 dark:text-white shrink-0">
              {formatCurrency(r.amount)}
            </span>

            <RowMenu onEdit={() => onEdit(r)} onDelete={() => setPendingDelete(r)} />
          </div>
        );
      })}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus recurring?"
        message={pendingDelete ? `"${pendingDelete.name}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
