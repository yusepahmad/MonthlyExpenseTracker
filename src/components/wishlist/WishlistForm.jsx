import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import Dropdown from "../ui/Dropdown";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
];

function itemToFormState(item) {
  return {
    name: item.name,
    price: formatNumberInput(String(item.price)),
    priority: item.priority || "medium",
  };
}

function blankForm() {
  return { name: "", price: "", priority: "medium" };
}

export default function WishlistForm({ onSaved, editingItem }) {
  const { dispatch } = useApp();
  const isEdit = Boolean(editingItem);
  const [form, setForm] = useState(() => (editingItem ? itemToFormState(editingItem) : blankForm()));
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const price = parseNumberInput(form.price);

    if (!form.name.trim()) {
      setError("Nama barang harus diisi");
      return;
    }
    if (!price || price <= 0) {
      setError("Harga harus lebih dari 0");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({
        type: "UPDATE_WISHLIST_ITEM",
        payload: { id: editingItem.id, name: form.name, price, priority: form.priority },
      });
    } else {
      dispatch({
        type: "ADD_WISHLIST_ITEM",
        payload: { id: generateId("wish"), name: form.name, price, priority: form.priority },
      });
    }

    onSaved?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm font-light text-red-600 bg-red-50/70 backdrop-blur-sm border border-red-100 dark:bg-red-900/30 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Nama Barang
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Contoh: Headphone, Sepatu, Kamera"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Harga
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Prioritas
        </label>
        <Dropdown
          value={form.priority}
          onChange={(value) => setForm((f) => ({ ...f, priority: value }))}
          options={PRIORITY_OPTIONS}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
      >
        {isEdit ? "Simpan Perubahan" : "Simpan"}
      </button>
    </form>
  );
}
