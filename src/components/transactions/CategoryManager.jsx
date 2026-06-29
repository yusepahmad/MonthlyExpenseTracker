import { useState } from "react";
import { Pencil, Trash2, Lock } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getAllCategories } from "../../lib/categories";
import CategoryForm from "./CategoryForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import Icon from "../ui/Icon";

export default function CategoryManager() {
  const { state, dispatch } = useApp();
  const [editingCategory, setEditingCategory] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const categories = getAllCategories(state.customCategories);
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  function handleDelete() {
    dispatch({ type: "DELETE_CATEGORY", payload: pendingDelete.name });
    setPendingDelete(null);
  }

  if (editingCategory) {
    return (
      <CategoryForm
        editingCategory={editingCategory}
        onSaved={() => setEditingCategory(null)}
        onCancel={() => setEditingCategory(null)}
      />
    );
  }

  function renderGroup(title, list) {
    return (
      <div>
        <h4 className="text-xs font-light text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
        <div className="rounded-xl bg-white/30 dark:bg-gray-900/30 border border-white/50 dark:border-gray-700/50 divide-y divide-white/40 dark:divide-gray-800/60">
          {list.map((category) => (
            <div key={category.name} className="flex items-center gap-2.5 px-3 py-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${category.color}22` }}
              >
                <Icon name={category.icon} className="w-4 h-4" style={{ color: category.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {category.name}
                </p>
                {category.subcategories.length > 0 && (
                  <p className="text-xs font-light text-gray-400 truncate">
                    {category.subcategories.join(", ")}
                  </p>
                )}
              </div>
              {category.isDefault && (
                <Lock className="w-3 h-3 text-gray-300 shrink-0" title="Default — hanya bisa diedit" />
              )}
              <button
                type="button"
                onClick={() => setEditingCategory(category)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-purple-600 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {!category.isDefault && (
                <button
                  type="button"
                  onClick={() => setPendingDelete(category)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {renderGroup("Pengeluaran", expenseCategories)}
      {renderGroup("Pemasukan", incomeCategories)}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus kategori?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" akan dihapus. Transaksi yang sudah memakai kategori ini tidak ikut terhapus.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
