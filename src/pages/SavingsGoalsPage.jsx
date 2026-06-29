import { useState } from "react";
import { useApp } from "../context/AppContext";
import SavingsGoalForm from "../components/savings/SavingsGoalForm";
import SavingsGoalCard from "../components/savings/SavingsGoalCard";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";

export default function SavingsGoalsPage() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  function openAddForm() {
    setEditingGoal(null);
    setShowForm(true);
  }

  function openEditForm(goal) {
    setEditingGoal(goal);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingGoal(null);
  }

  function handleDelete() {
    dispatch({ type: "DELETE_SAVINGS_GOAL", payload: pendingDelete.id });
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Target Tabungan</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      {state.savingsGoals.length === 0 ? (
        <div className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 shadow-soft animate-fade-in">
          <EmptyState message="Belum ada target tabungan." iconName="PiggyBank" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEditForm}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={closeForm} title={editingGoal ? "Edit Target" : "Tambah Target"}>
        <SavingsGoalForm onSaved={closeForm} editingGoal={editingGoal} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Hapus target tabungan?"
        message={pendingDelete ? `"${pendingDelete.name}" akan dihapus permanen.` : ""}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
