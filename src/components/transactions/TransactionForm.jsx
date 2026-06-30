import { useState } from "react";
import { useApp, DEFAULT_ACCOUNT_ID } from "../../context/AppContext";
import { getCategoriesByType, getSubcategories } from "../../lib/categories";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import { suggestCategory } from "../../lib/categoryKeywords";
import { findSimilarRecentTransaction } from "../../lib/smartSuggestion";
import CategoryForm from "./CategoryForm";
import CategoryManager from "./CategoryManager";
import TransferForm from "./TransferForm";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";
import Modal from "../ui/Modal";
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
    account: DEFAULT_ACCOUNT_ID,
    allocationTag: null,
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
    account: transaction.account || DEFAULT_ACCOUNT_ID,
    allocationTag: transaction.allocationTag || null,
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
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);
  const [mode, setMode] = useState("transaction");

  const categoriesForType = getCategoriesByType(form.type, state.customCategories);
  const subcategories = getSubcategories(form.category, state.customCategories);

  const amountSuggestion =
    !isEdit && !dismissedSuggestion
      ? findSimilarRecentTransaction(form.amount, state.transactions)
      : null;

  function handleTypeChange(type) {
    const firstOfType = getCategoriesByType(type, state.customCategories)[0];
    setForm((f) => ({
      ...f,
      type,
      category: firstOfType?.name || "",
      subcategory: "",
      allocationTag: type === "income" ? f.allocationTag : null,
      categoryTouched: false,
    }));
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
          account: form.account,
          allocationTag: form.type === "income" ? form.allocationTag : null,
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
          account: form.account,
          allocationTag: form.type === "income" ? form.allocationTag : null,
          is_recurring: false,
          recurring_id: null,
        },
      });
    }

    onSaved?.();
  }

  const hasDraftContent =
    !isEdit && (form.amount || form.description || form.subcategory || form.date !== todayStr());

  if (mode === "transfer") {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("transaction")}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300 transition-all duration-200"
          >
            Transaksi
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow scale-[1.02] transition-all duration-200"
          >
            Transfer
          </button>
        </div>
        <TransferForm onSaved={onSaved} />
      </div>
    );
  }

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
        {!isEdit && (
          <button
            type="button"
            onClick={() => setMode("transfer")}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300 transition-all duration-200"
          >
            Transfer
          </button>
        )}
      </div>

      {form.type === "income" && (
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
            Alokasikan ke (opsional)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, allocationTag: f.allocationTag === "emergency" ? null : "emergency" }))}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                form.allocationTag === "emergency"
                  ? "bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-glow"
                  : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
              }`}
            >
              Dana Darurat
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, allocationTag: f.allocationTag === "investment" ? null : "investment" }))}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                form.allocationTag === "investment"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow"
                  : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/60 dark:border-gray-700/60 text-gray-500 dark:text-gray-300"
              }`}
            >
              Investasi
            </button>
          </div>
          <p className="text-xs font-light text-gray-400 mt-1.5">
            Biarkan tidak ditandai kalau pemasukan ini untuk biaya hidup sehari-hari.
          </p>
        </div>
      )}

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
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Akun
        </label>
        <Dropdown
          value={form.account}
          onChange={(value) => setForm((f) => ({ ...f, account: value }))}
          options={state.accounts.map((a) => ({ value: a.id, label: a.name }))}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            Kategori
          </label>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCategoryForm((v) => !v)}
              className="text-xs text-purple-600 font-medium hover:underline"
            >
              {showCategoryForm ? "Tutup" : "+ Kategori baru"}
            </button>
            <button
              type="button"
              onClick={() => setShowCategoryManager(true)}
              className="text-xs text-gray-400 font-light hover:text-purple-600 hover:underline"
            >
              Kelola
            </button>
          </div>
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

      <Modal
        open={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        title="Kelola Kategori"
      >
        <CategoryManager />
      </Modal>
    </form>
  );
}
