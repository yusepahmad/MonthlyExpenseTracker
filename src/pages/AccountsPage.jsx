import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAccountBalances } from "../hooks/useAccountBalances";
import AccountForm from "../components/accounts/AccountForm";
import AccountCard from "../components/accounts/AccountCard";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";

export default function AccountsPage() {
  const { state, dispatch } = useApp();
  const accounts = useAccountBalances();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  function openAddForm() {
    setEditingAccount(null);
    setShowForm(true);
  }

  function openEditForm(account) {
    setEditingAccount(account);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingAccount(null);
  }

  function handleDelete() {
    const stillInUse = state.transactions.some((t) => t.account === pendingDelete.id);
    if (stillInUse) {
      setDeleteError(
        `"${pendingDelete.name}" masih punya transaksi. Pindahkan atau hapus transaksi itu dulu sebelum menghapus akun ini.`
      );
      setPendingDelete(null);
      return;
    }
    dispatch({ type: "DELETE_ACCOUNT", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Akun</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      {deleteError && (
        <p className="text-sm font-light text-red-600 bg-red-50/70 backdrop-blur-sm border border-red-100 dark:bg-red-900/30 px-3 py-2 rounded-xl mb-4">
          {deleteError}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={openEditForm}
            onDelete={(a) => {
              setDeleteError("");
              setPendingDelete(a);
            }}
          />
        ))}
      </div>

      <Modal open={showForm} onClose={closeForm} title={editingAccount ? "Edit Akun" : "Tambah Akun"}>
        <AccountForm onSaved={closeForm} editingAccount={editingAccount} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus akun?"
        message={pendingDelete ? `"${pendingDelete.name}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
