import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { makeCustomCategoryColor } from "../../lib/categories";
import Icon, { PICKABLE_ICONS } from "../ui/Icon";

export default function CategoryForm({ type, editingCategory, onSaved, onCancel }) {
  const { state, dispatch } = useApp();
  const isEdit = Boolean(editingCategory);

  const [name, setName] = useState(editingCategory?.name || "");
  const [subcategoriesText, setSubcategoriesText] = useState(
    (editingCategory?.subcategories || []).join(", ")
  );
  const [icon, setIcon] = useState(editingCategory?.icon || PICKABLE_ICONS[0]);
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama kategori harus diisi");
      return;
    }

    const subcategories = subcategoriesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEdit) {
      dispatch({
        type: "UPDATE_CATEGORY",
        payload: {
          originalName: editingCategory.name,
          name: trimmed,
          type: editingCategory.type,
          color: editingCategory.color,
          icon,
          subcategories,
        },
      });
      setError("");
      onSaved?.(trimmed);
      return;
    }

    dispatch({
      type: "ADD_CATEGORY",
      payload: {
        name: trimmed,
        type,
        icon,
        subcategories,
        color: makeCustomCategoryColor(state.customCategories.length),
      },
    });
    setError("");
    onSaved?.(trimmed);
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
          {isEdit ? "Nama Kategori" : "Nama Kategori Baru"}
        </label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Asuransi"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-light text-gray-600 dark:text-gray-300 mb-1.5">
          Pilih Icon
        </label>
        <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl bg-white/40 dark:bg-gray-900/40 border border-white/50 dark:border-gray-700/50 max-h-40 overflow-y-auto">
          {PICKABLE_ICONS.map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => setIcon(iconName)}
              className={`flex items-center justify-center aspect-square rounded-lg transition-all duration-150 ${
                icon === iconName
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-110 shadow-glow"
                  : "text-gray-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Icon name={iconName} className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-light text-gray-600 dark:text-gray-300 mb-1.5">
          Sub-kategori (opsional, pisahkan dengan koma)
        </label>
        <input
          type="text"
          value={subcategoriesText}
          onChange={(e) => setSubcategoriesText(e.target.value)}
          placeholder="Contoh: Jiwa, Kesehatan"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform"
        >
          {isEdit ? "Simpan Perubahan" : "Tambah"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
