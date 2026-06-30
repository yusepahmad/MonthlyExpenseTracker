import { useState } from "react";
import { Pencil, Trash2, Lock, Plus } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { getAllCategories } from "../../lib/categories";
import CategoryForm from "./CategoryForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import Dropdown from "../ui/Dropdown";
import Icon from "../ui/Icon";

function AddSubcategoryForm({ categories, onDone }) {
  const { dispatch } = useApp();
  const [categoryName, setCategoryName] = useState(categories[0]?.name || "");
  const [subName, setSubName] = useState("");
  const [error, setError] = useState("");

  const selected = categories.find((c) => c.name === categoryName);

  function handleSubmit() {
    const trimmed = subName.trim();
    if (!trimmed) {
      setError("Nama sub-kategori harus diisi");
      return;
    }
    if (selected.subcategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError("Sub-kategori ini sudah ada");
      return;
    }

    dispatch({
      type: "UPDATE_CATEGORY",
      payload: {
        originalName: selected.name,
        overridesDefault: selected.isDefault ? selected.overridesDefault || selected.name : undefined,
        name: selected.name,
        type: selected.type,
        color: selected.color,
        icon: selected.icon,
        subcategories: [...selected.subcategories, trimmed],
        isEssential: selected.isEssential,
      },
    });
    setSubName("");
    setError("");
    onDone?.();
  }

  return (
    <div className="space-y-3 rounded-xl p-3.5 bg-white/30 dark:bg-gray-800/40 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 animate-fade-in">
      {error && (
        <p className="text-sm font-light text-red-600 bg-red-50/70 backdrop-blur-sm border border-red-100 dark:bg-red-900/30 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-light text-gray-600 dark:text-gray-300 mb-1.5">
          Kategori
        </label>
        <Dropdown
          value={categoryName}
          onChange={setCategoryName}
          options={categories.map((c) => ({
            value: c.name,
            label: c.name,
            icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
          }))}
        />
      </div>
      <div>
        <label className="block text-sm font-light text-gray-600 dark:text-gray-300 mb-1.5">
          Nama Sub-kategori Baru
        </label>
        <input
          type="text"
          autoFocus
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
          placeholder="Contoh: Delivery"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform"
        >
          Tambah
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 py-2 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default function CategoryManager() {
  const { state, dispatch } = useApp();
  const [editingCategory, setEditingCategory] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [showAddSub, setShowAddSub] = useState(false);

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

  if (showAddSub) {
    return <AddSubcategoryForm categories={categories} onDone={() => setShowAddSub(false)} />;
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
              {category.type === "expense" && category.isEssential === false && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shrink-0">
                  Non-Esensial
                </span>
              )}
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
    <div className="space-y-4 pb-1">
      <button
        type="button"
        onClick={() => setShowAddSub(true)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-purple-300/60 dark:border-purple-700/60 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Tambah Sub-kategori
      </button>

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
