import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { formatNumberInput, parseNumberInput } from "../../lib/utils";

export default function InvestmentValueForm({ onSaved, onCancel }) {
  const { state, dispatch } = useApp();
  const [value, setValue] = useState(
    state.allocationSettings.investmentValue !== null
      ? formatNumberInput(String(state.allocationSettings.investmentValue))
      : ""
  );
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const investmentValue = parseNumberInput(value);
    if (!investmentValue || investmentValue < 0) {
      setError("Nilai investasi harus lebih dari 0");
      return;
    }
    setError("");

    dispatch({
      type: "SET_ALLOCATION_SETTINGS",
      payload: { ...state.allocationSettings, investmentValue },
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
          Nilai Portofolio Investasi Saat Ini
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={value}
            onChange={(e) => setValue(formatNumberInput(e.target.value))}
            placeholder="0"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          />
        </div>
        <p className="text-xs font-light text-gray-400 mt-1.5">
          Cek total nilai reksa dana/ETF/saham kamu sekarang, lalu masukkan di sini. Untung/rugi dihitung dari selisihnya dengan total yang sudah dialokasikan ke investasi sejak awal.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/60 dark:border-gray-600/60 bg-white/30 dark:bg-transparent backdrop-blur-sm text-sm font-light text-gray-600 dark:text-gray-300"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
