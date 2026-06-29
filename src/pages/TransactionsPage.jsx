import { useState } from "react";
import TransactionForm, { createBlankDraft } from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import Modal from "../components/ui/Modal";

export default function TransactionsPage({ hideAmount }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [draft, setDraft] = useState(createBlankDraft());

  function openAddForm() {
    setEditingTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction) {
    setEditingTransaction(transaction);
    setDraft(null);
    setShowForm(true);
  }

  function hideModal() {
    setShowForm(false);
  }

  function handleSaved() {
    setShowForm(false);
    setEditingTransaction(null);
    setDraft(createBlankDraft());
  }

  function discardDraft() {
    setEditingTransaction(null);
    setDraft(createBlankDraft());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-display text-lg font-medium text-gray-900 dark:text-white">Transaksi</h2>
        <button
          onClick={openAddForm}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 hover:scale-[1.03] shadow-glow"
        >
          + Tambah
        </button>
      </div>

      <TransactionList onEdit={openEditForm} hideAmount={hideAmount} />

      <Modal open={showForm} onClose={hideModal} title={editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}>
        <TransactionForm
          onSaved={handleSaved}
          onDiscard={discardDraft}
          editingTransaction={editingTransaction}
          draft={draft}
          onDraftChange={setDraft}
        />
      </Modal>
    </div>
  );
}
