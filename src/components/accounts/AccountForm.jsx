import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { generateId } from "../../lib/utils";

export default function AccountForm({ onSaved, editingAccount }) {
  const { dispatch } = useApp();
  const isEdit = Boolean(editingAccount);
  const [name, setName] = useState(editingAccount?.name || "");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama akun harus diisi");
      return;
    }
    setError("");

    if (isEdit) {
      dispatch({ type: "UPDATE_ACCOUNT", payload: { id: editingAccount.id, name: trimmed } });
    } else {
      dispatch({ type: "ADD_ACCOUNT", payload: { id: generateId("acc"), name: trimmed, isDefault: false } });
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
          Nama Akun
        </label>
        <input
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Bank BCA, OVO, Dompet"
          className="w-full px-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl backdrop-saturate-150 font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60"
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
