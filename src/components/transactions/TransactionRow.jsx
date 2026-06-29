import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getCategory } from "../../lib/categories";
import { formatDate } from "../../lib/utils";
import Icon from "../ui/Icon";
import RowMenu from "../ui/RowMenu";
import ConfirmDialog from "../ui/ConfirmDialog";
import AmountText from "../ui/AmountText";

export default function TransactionRow({ transaction, onEdit, hideAmount }) {
  const { state, dispatch } = useApp();
  const category = getCategory(transaction.category, state.customCategories);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDelete() {
    dispatch({ type: "DELETE_TRANSACTION", payload: transaction.id });
    setConfirmOpen(false);
  }

  return (
    <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors duration-200 hover:bg-white/40 dark:hover:bg-gray-800/30">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/40"
        style={{ backgroundColor: `${category?.color}22` }}
      >
        <Icon name={category?.icon} className="w-5 h-5" style={{ color: category?.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {transaction.description || transaction.category}
        </p>
        <p className="text-xs font-light text-gray-400 mt-0.5">
          {formatDate(transaction.date)}
          {transaction.subcategory && <span> · {transaction.subcategory}</span>}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p
          className={`text-sm font-medium ${
            transaction.type === "income" ? "text-green-600" : "text-red-500"
          }`}
        >
          <AmountText
            amount={transaction.amount}
            hide={hideAmount}
            prefix={transaction.type === "income" ? "+" : "-"}
          />
        </p>
      </div>

      <RowMenu onEdit={() => onEdit(transaction)} onDelete={() => setConfirmOpen(true)} />

      <ConfirmDialog
        open={confirmOpen}
        title="Hapus transaksi?"
        message={`"${transaction.description || transaction.category}" akan dihapus permanen.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
