import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import DatePicker from "../ui/DatePicker";

function debtToFormState(debt) {
  return {
    name: debt.name,
    totalAmount: formatNumberInput(String(debt.totalAmount)),
    remainingAmount: formatNumberInput(String(debt.remainingAmount)),
    dueDate: debt.dueDate || "",
  };
}

function blankForm() {
  return { name: "", totalAmount: "", remainingAmount: "", dueDate: "" };
}

export default function DebtForm({ onSaved, editingDebt }) {
  const { dispatch } = useApp();
  const isEdit = Boolean(editingDebt);
  const [form, setForm] = useState(() => (editingDebt ? debtToFormState(editingDebt) : blankForm()));
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const totalAmount = parseNumberInput(form.totalAmount);
    const remainingAmount = parseNumberInput(form.remainingAmount);

    if (!form.name.trim()) {
      setError("Nama hutang harus diisi");
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      setError("Total hutang harus lebih dari 0");
      return;
    }
    if (remainingAmount < 0 || remainingAmount > totalAmount) {
      setError("Sisa hutang harus di antara 0 dan total hutang");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({
        type: "UPDATE_DEBT",
        payload: { id: editingDebt.id, name: form.name, totalAmount, remainingAmount, dueDate: form.dueDate },
      });
    } else {
      dispatch({
        type: "ADD_DEBT",
        payload: { id: generateId("debt"), name: form.name, totalAmount, remainingAmount, dueDate: form.dueDate },
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
          Nama Hutang
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Contoh: Cicilan Motor, KTA Bank"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Total Hutang
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.totalAmount}
            onChange={(e) => setForm((f) => ({ ...f, totalAmount: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Sisa Hutang
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.remainingAmount}
            onChange={(e) => setForm((f) => ({ ...f, remainingAmount: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Jatuh Tempo (opsional)
        </label>
        <DatePicker
          value={form.dueDate}
          onChange={(value) => setForm((f) => ({ ...f, dueDate: value }))}
          placeholder="Tanpa jatuh tempo"
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
