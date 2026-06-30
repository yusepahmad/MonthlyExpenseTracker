import { useState } from "react";
import { useApp } from "../context/AppContext";
import DebtForm from "../components/debts/DebtForm";
import DebtCard from "../components/debts/DebtCard";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";

export default function DebtsPage() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  function openAddForm() {
    setEditingDebt(null);
    setShowForm(true);
  }

  function openEditForm(debt) {
    setEditingDebt(debt);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingDebt(null);
  }

  function handleDelete() {
    dispatch({ type: "DELETE_DEBT", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Hutang</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      {state.debts.length === 0 ? (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft animate-fade-in">
          <EmptyState message="Belum ada hutang yang dicatat." iconName="CreditCard" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.debts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onEdit={openEditForm} onDelete={setPendingDelete} />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={closeForm} title={editingDebt ? "Edit Hutang" : "Tambah Hutang"}>
        <DebtForm onSaved={closeForm} editingDebt={editingDebt} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus hutang?"
        message={pendingDelete ? `"${pendingDelete.name}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
