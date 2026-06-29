import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getCategoriesByType, getSubcategories } from "../../lib/categories";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import { suggestCategory } from "../../lib/categoryKeywords";
import { findSimilarRecentTransaction } from "../../lib/smartSuggestion";
import CategoryForm from "./CategoryForm";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import Icon from "../ui/Icon";
import SuggestionChip from "./SuggestionChip";

const todayStr = () => new Date().toISOString().slice(0, 10);

export function createBlankDraft() {
  return {
    date: todayStr(),
    category: "Makan",
    subcategory: "",
    amount: "",
    type: "expense",
    description: "",
    categoryTouched: false,
  };
}

function transactionToFormState(transaction) {
  return {
    date: transaction.date,
    category: transaction.category,
    subcategory: transaction.subcategory || "",
    amount: formatNumberInput(String(transaction.amount)),
    type: transaction.type,
    description: transaction.description || "",
    categoryTouched: true,
  };
}

export default function TransactionForm({ onSaved, onDiscard, editingTransaction, draft, onDraftChange }) {
  const { state, dispatch } = useApp();
  const isEdit = Boolean(editingTransaction);

  // Edit mode keeps its own local state (changes aren't written to global
  // state until submit, so there's nothing to preserve across an outside click).
  const [editForm, setEditForm] = useState(() =>
    editingTransaction ? transactionToFormState(editingTransaction) : createBlankDraft()
  );

  const form = isEdit ? editForm : draft || createBlankDraft();
  const setForm = isEdit ? setEditForm : onDraftChange;

  const [error, setError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const categoriesForType = getCategoriesByType(form.type, state.customCategories);
  const subcategories = getSubcategories(form.category, state.customCategories);

  const amountSuggestion =
    !isEdit && !dismissedSuggestion
      ? findSimilarRecentTransaction(form.amount, state.transactions)
      : null;

  function handleTypeChange(type) {
    const firstOfType = getCategoriesByType(type, state.customCategories)[0];
    setForm((f) => ({ ...f, type, category: firstOfType?.name || "", subcategory: "", categoryTouched: false }));
  }

  function handleCategoryChange(category) {
    setForm((f) => ({ ...f, category, subcategory: "", categoryTouched: true }));
  }

  function handleCategoryCreated(name) {
    setForm((f) => ({ ...f, category: name, subcategory: "", categoryTouched: true }));
    setShowCategoryForm(false);
  }

  function handleDescriptionChange(value) {
    setForm((f) => {
      const next = { ...f, description: value };
      if (!f.categoryTouched) {
        const suggested = suggestCategory(value);
        if (suggested && getCategoriesByType(f.type, state.customCategories).some((c) => c.name === suggested)) {
          next.category = suggested;
        }
      }
      return next;
    });
  }

  function applySuggestion() {
    setForm((f) => ({
      ...f,
      description: amountSuggestion.description || amountSuggestion.category,
      category: amountSuggestion.category,
      categoryTouched: true,
    }));
    setDismissedSuggestion(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const amount = parseNumberInput(form.amount);
    if (!amount || amount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }
    if (form.date > todayStr()) {
      setError("Tanggal tidak boleh di masa depan");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({
        type: "UPDATE_TRANSACTION",
        payload: {
          id: editingTransaction.id,
          date: form.date,
          category: form.category,
          subcategory: form.subcategory,
          amount,
          type: form.type,
          description: form.description,
        },
      });
    } else {
      dispatch({
        type: "ADD_TRANSACTION",
        payload: {
          id: generateId(),
          date: form.date,
          category: form.category,
          subcategory: form.subcategory,
          amount,
          type: form.type,
          description: form.description,
          is_recurring: false,
          recurring_id: null,
        },
      });
    }

    onSaved?.();
  }

  const hasDraftContent =
    !isEdit && (form.amount || form.description || form.subcategory || form.date !== todayStr());

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm font-light text-red-600 bg-red-50/70 backdrop-blur-sm border border-red-100 dark:bg-red-900/30 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            form.type === "expense"
              ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-glow-pink scale-[1.02]"
              : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            form.type === "income"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-glow-green scale-[1.02]"
              : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
          }`}
        >
          Pemasukan
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Tanggal
        </label>
        <DatePicker
          value={form.date}
          max={todayStr()}
          onChange={(value) => setForm((f) => ({ ...f, date: value }))}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            Kategori
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryForm((v) => !v)}
            className="text-xs text-purple-600 font-medium hover:underline"
          >
            {showCategoryForm ? "Tutup" : "+ Kategori baru"}
          </button>
        </div>

        {showCategoryForm ? (
          <CategoryForm
            type={form.type}
            onSaved={handleCategoryCreated}
            onCancel={() => setShowCategoryForm(false)}
          />
        ) : (
          <Dropdown
            value={form.category}
            onChange={handleCategoryChange}
            options={categoriesForType.map((c) => ({
              value: c.name,
              label: c.name,
              icon: <Icon name={c.icon} className="w-4 h-4" style={{ color: c.color }} />,
            }))}
          />
        )}
      </div>

      {!showCategoryForm && subcategories.length > 0 && (
        <div>
          <label className="block text-sm font-light text-gray-600 dark:text-gray-300 mb-1.5">
            Sub-kategori (opsional)
          </label>
          <Dropdown
            value={form.subcategory}
            onChange={(value) => setForm((f) => ({ ...f, subcategory: value }))}
            placeholder="- Tanpa sub-kategori -"
            options={[
              { value: "", label: "- Tanpa sub-kategori -" },
              ...subcategories.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      )}

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
            onChange={(e) => {
              setDismissedSuggestion(false);
              setForm((f) => ({ ...f, amount: formatNumberInput(e.target.value) }));
            }}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 focus:bg-white/60 transition-colors"
          />
        </div>
        {amountSuggestion && (
          <div className="mt-2">
            <SuggestionChip
              transaction={amountSuggestion}
              onAccept={applySuggestion}
              onDismiss={() => setDismissedSuggestion(true)}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Deskripsi (opsional)
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="Contoh: Ayam geprek"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 focus:bg-white/60 transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
      >
        {isEdit ? "Simpan Perubahan" : "Simpan"}
      </button>

      {hasDraftContent && (
        <button
          type="button"
          onClick={onDiscard}
          className="w-full text-xs font-light text-gray-400 hover:text-red-500 transition-colors"
        >
          Buang draft
        </button>
      )}
    </form>
  );
}
