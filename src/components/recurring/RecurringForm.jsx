import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getCategoriesByType } from "../../lib/categories";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import Dropdown from "../ui/Dropdown";
import Icon from "../ui/Icon";

const FREQUENCY_OPTIONS = [
  { value: "monthly", label: "Bulanan" },
  { value: "weekly", label: "Mingguan" },
];

function recurringToFormState(recurring) {
  return {
    name: recurring.name,
    category: recurring.category,
    amount: formatNumberInput(String(recurring.amount)),
    frequency: recurring.frequency,
    day_of_month: String(recurring.day_of_month),
    is_active: recurring.is_active,
  };
}

function blankForm(categoriesForType) {
  return {
    name: "",
    category: categoriesForType[0]?.name || "",
    amount: "",
    frequency: "monthly",
    day_of_month: "1",
    is_active: true,
  };
}

export default function RecurringForm({ onSaved, editingRecurring }) {
  const { state, dispatch } = useApp();
  const isEdit = Boolean(editingRecurring);
  const categoriesForType = getCategoriesByType("expense", state.customCategories);

  const [form, setForm] = useState(() =>
    editingRecurring ? recurringToFormState(editingRecurring) : blankForm(categoriesForType)
  );
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const amount = parseNumberInput(form.amount);
    const dayOfMonth = Number(form.day_of_month);

    if (!form.name.trim()) {
      setError("Nama harus diisi");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }
    if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 28) {
      setError("Tanggal harus antara 1-28");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({
        type: "UPDATE_RECURRING",
        payload: {
          id: editingRecurring.id,
          name: form.name,
          category: form.category,
          amount,
          frequency: form.frequency,
          day_of_month: dayOfMonth,
          is_active: form.is_active,
        },
      });
    } else {
      dispatch({
        type: "ADD_RECURRING",
        payload: {
          id: generateId("rec"),
          name: form.name,
          category: form.category,
          amount,
          frequency: form.frequency,
          day_of_month: dayOfMonth,
          is_active: form.is_active,
        },
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
          Nama
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Contoh: Netflix, Internet, Listrik"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Kategori
        </label>
        <Dropdown
          value={form.category}
          onChange={(value) => setForm((f) => ({ ...f, category: value }))}
          options={categoriesForType.map((c) => ({
            value: c.name,
            label: c.name,
            icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
          }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Nominal
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            Frekuensi
          </label>
          <Dropdown
            value={form.frequency}
            onChange={(value) => setForm((f) => ({ ...f, frequency: value }))}
            options={FREQUENCY_OPTIONS}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            Tanggal (1-28)
          </label>
          <input
            type="number"
            min="1"
            max="28"
            value={form.day_of_month}
            onChange={(e) => setForm((f) => ({ ...f, day_of_month: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
          className={`w-10 h-6 rounded-full transition-colors relative ${
            form.is_active ? "bg-gradient-to-r from-indigo-500 to-purple-600" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              form.is_active ? "translate-x-4" : ""
            }`}
          />
        </button>
        <span className="text-sm font-light text-gray-600 dark:text-gray-300">Aktif</span>
      </label>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
      >
        {isEdit ? "Simpan Perubahan" : "Simpan"}
      </button>
    </form>
  );
}
