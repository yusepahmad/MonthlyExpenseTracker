import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { CHALLENGE_TYPES } from "../../lib/challenges";
import { getCategoriesByType } from "../../lib/categories";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import Icon from "../ui/Icon";

const todayStr = () => new Date().toISOString().slice(0, 10);

function challengeToFormState(challenge) {
  return {
    type: challenge.type,
    category: challenge.category,
    targetAmount: challenge.targetAmount ? formatNumberInput(String(challenge.targetAmount)) : "",
    startDate: challenge.startDate,
    endDate: challenge.endDate,
  };
}

function blankForm(expenseCategories) {
  return {
    type: "no_spend",
    category: expenseCategories[0]?.name || "",
    targetAmount: "",
    startDate: todayStr(),
    endDate: todayStr(),
  };
}

export default function ChallengeForm({ onSaved, editingChallenge }) {
  const { state, dispatch } = useApp();
  const isEdit = Boolean(editingChallenge);
  const expenseCategories = getCategoriesByType("expense", state.customCategories);
  const [form, setForm] = useState(() =>
    editingChallenge ? challengeToFormState(editingChallenge) : blankForm(expenseCategories)
  );
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.category) {
      setError("Kategori harus dipilih");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("Tanggal selesai tidak boleh sebelum tanggal mulai");
      return;
    }
    if (form.type === "spending_limit") {
      const targetAmount = parseNumberInput(form.targetAmount);
      if (!targetAmount || targetAmount <= 0) {
        setError("Target hemat harus lebih dari 0");
        return;
      }
    }
    setError("");

    const payload = {
      type: form.type,
      category: form.category,
      targetAmount: form.type === "spending_limit" ? parseNumberInput(form.targetAmount) : null,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    if (isEdit) {
      dispatch({ type: "UPDATE_CHALLENGE", payload: { id: editingChallenge.id, ...payload } });
    } else {
      dispatch({ type: "ADD_CHALLENGE", payload: { id: generateId("chal"), ...payload } });
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
          Jenis Challenge
        </label>
        <Dropdown
          value={form.type}
          onChange={(value) => setForm((f) => ({ ...f, type: value }))}
          options={CHALLENGE_TYPES}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Kategori
        </label>
        <Dropdown
          value={form.category}
          onChange={(value) => setForm((f) => ({ ...f, category: value }))}
          options={expenseCategories.map((c) => ({
            value: c.name,
            label: c.name,
            icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
          }))}
        />
      </div>

      {form.type === "spending_limit" && (
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            Target Maksimal Pengeluaran
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
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Mulai
        </label>
        <DatePicker value={form.startDate} onChange={(value) => setForm((f) => ({ ...f, startDate: value }))} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Selesai
        </label>
        <DatePicker value={form.endDate} onChange={(value) => setForm((f) => ({ ...f, endDate: value }))} />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
      >
        {isEdit ? "Simpan Perubahan" : "Mulai Challenge"}
      </button>
    </form>
  );
}
