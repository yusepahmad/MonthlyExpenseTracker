import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import DatePicker from "../ui/DatePicker";

function goalToFormState(goal) {
  return {
    name: goal.name,
    targetAmount: formatNumberInput(String(goal.targetAmount)),
    currentAmount: formatNumberInput(String(goal.currentAmount)),
    deadline: goal.deadline || "",
  };
}

function blankForm() {
  return { name: "", targetAmount: "", currentAmount: "0", deadline: "" };
}

export default function SavingsGoalForm({ onSaved, editingGoal }) {
  const { dispatch } = useApp();
  const isEdit = Boolean(editingGoal);
  const [form, setForm] = useState(() => (editingGoal ? goalToFormState(editingGoal) : blankForm()));
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const targetAmount = parseNumberInput(form.targetAmount);
    const currentAmount = parseNumberInput(form.currentAmount);

    if (!form.name.trim()) {
      setError("Nama target harus diisi");
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      setError("Target nominal harus lebih dari 0");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({
        type: "UPDATE_SAVINGS_GOAL",
        payload: { id: editingGoal.id, name: form.name, targetAmount, currentAmount, deadline: form.deadline },
      });
    } else {
      dispatch({
        type: "ADD_SAVINGS_GOAL",
        payload: { id: generateId("goal"), name: form.name, targetAmount, currentAmount, deadline: form.deadline },
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
          Nama Target
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Contoh: Laptop, Motor, Liburan"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Target Nominal
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.targetAmount}
            onChange={(e) => setForm((f) => ({ ...f, targetAmount: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Sudah Terkumpul
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.currentAmount}
            onChange={(e) => setForm((f) => ({ ...f, currentAmount: formatNumberInput(e.target.value) }))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Target Tanggal (opsional)
        </label>
        <DatePicker
          value={form.deadline}
          onChange={(value) => setForm((f) => ({ ...f, deadline: value }))}
          placeholder="Tanpa target tanggal"
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
