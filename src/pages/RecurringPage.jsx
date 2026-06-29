import { useState } from "react";
import RecurringForm from "../components/recurring/RecurringForm";
import RecurringList from "../components/recurring/RecurringList";
import Modal from "../components/ui/Modal";

export default function RecurringPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  function openAddForm() {
    setEditingRecurring(null);
    setShowForm(true);
  }

  function openEditForm(recurring) {
    setEditingRecurring(recurring);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingRecurring(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Recurring</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      <RecurringList onEdit={openEditForm} />

      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingRecurring ? "Edit Recurring" : "Tambah Recurring"}
      >
        <RecurringForm onSaved={closeForm} editingRecurring={editingRecurring} />
      </Modal>
    </div>
  );
}
