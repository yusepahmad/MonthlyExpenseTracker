import { useState } from "react";
import { useApp } from "../../context/AppContext";

export default function AllocationSettingsForm({ onSaved, onCancel }) {
  const { state, dispatch } = useApp();
  const [emergencyPercent, setEmergencyPercent] = useState(String(state.allocationSettings.emergencyPercent));
  const [investmentPercent, setInvestmentPercent] = useState(String(state.allocationSettings.investmentPercent));
  const [error, setError] = useState("");

  const emergency = Number(emergencyPercent) || 0;
  const investment = Number(investmentPercent) || 0;
  const living = Math.max(0, 100 - emergency - investment);

  function handleSubmit(e) {
    e.preventDefault();
    if (emergency < 0 || investment < 0 || emergency + investment > 100) {
      setError("Total dana darurat + investasi tidak boleh lebih dari 100%");
      return;
    }
    setError("");

    dispatch({
      type: "SET_ALLOCATION_SETTINGS",
      payload: { emergencyPercent: emergency, investmentPercent: investment, livingPercent: living },
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
          Dana Darurat (%)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={emergencyPercent}
          onChange={(e) => setEmergencyPercent(e.target.value.replace(/\D/g, ""))}
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Investasi (%)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={investmentPercent}
          onChange={(e) => setInvestmentPercent(e.target.value.replace(/\D/g, ""))}
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        />
      </div>

      <div className="rounded-xl bg-white/30 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 px-3 py-2.5">
        <p className="text-xs font-light text-gray-500 dark:text-gray-400">
          Sisa untuk biaya hidup: <span className="font-medium text-gray-700 dark:text-gray-200">{living}%</span>
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
