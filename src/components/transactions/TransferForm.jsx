import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generateId, formatNumberInput, parseNumberInput } from "../../lib/utils";
import Dropdown from "../ui/Dropdown";
import DatePicker from "../ui/DatePicker";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function TransferForm({ onSaved }) {
  const { state, dispatch } = useApp();
  const [fromAccount, setFromAccount] = useState(state.accounts[0]?.id || "");
  const [toAccount, setToAccount] = useState(state.accounts[1]?.id || state.accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const accountOptions = state.accounts.map((a) => ({ value: a.id, label: a.name }));

  function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseNumberInput(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Nominal harus lebih dari 0");
      return;
    }
    if (fromAccount === toAccount) {
      setError("Akun asal dan tujuan harus berbeda");
      return;
    }
    if (date > todayStr()) {
      setError("Tanggal tidak boleh di masa depan");
      return;
    }
    setError("");

    const fromName = state.accounts.find((a) => a.id === fromAccount)?.name || fromAccount;
    const toName = state.accounts.find((a) => a.id === toAccount)?.name || toAccount;
    const transferId = generateId("transfer");
    const baseDescription = description || `Transfer ${fromName} → ${toName}`;

    dispatch({
      type: "ADD_TRANSFER",
      payload: {
        fromAccount,
        toAccount,
        fromTransaction: {
          id: generateId(),
          date,
          category: "Lainnya",
          subcategory: "",
          amount: parsedAmount,
          type: "expense",
          description: baseDescription,
          is_recurring: false,
          recurring_id: null,
          transfer_id: transferId,
        },
        toTransaction: {
          id: generateId(),
          date,
          category: "Lainnya",
          subcategory: "",
          amount: parsedAmount,
          type: "income",
          description: baseDescription,
          is_recurring: false,
          recurring_id: null,
          transfer_id: transferId,
        },
      },
    });

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
          Dari Akun
        </label>
        <Dropdown value={fromAccount} onChange={setFromAccount} options={accountOptions} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Ke Akun
        </label>
        <Dropdown value={toAccount} onChange={setToAccount} options={accountOptions} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Tanggal
        </label>
        <DatePicker value={date} max={todayStr()} onChange={setDate} />
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
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 focus:bg-white/60 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Deskripsi (opsional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Top up e-wallet"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 focus:bg-white/60 transition-colors"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
      >
        Transfer
      </button>
    </form>
  );
}
